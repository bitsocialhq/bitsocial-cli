import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { finished as streamFinished } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import decompress from "decompress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.join(__dirname, "..");

async function main() {
    const distDir = path.join(packageRoot, "dist");
    try {
        await fs.access(distDir);
    } catch {
        // dist/ doesn't exist — dev install before build, skip silently
        return;
    }

    const dstOfWebui = path.join(distDir, "webuis");
    try {
        await fs.mkdir(dstOfWebui);
    } catch (e) {
        if (e.code === "EEXIST") {
            console.log("Web UIs directory already exists, skipping download");
            return;
        }
        throw e;
    }

    const pkg = JSON.parse(await fs.readFile(path.join(packageRoot, "package.json"), "utf-8"));
    const webuis = pkg.webuis;
    if (!webuis || webuis.length === 0) {
        console.warn("Warning: No webuis configured in package.json");
        return;
    }

    const githubToken = process.env["GITHUB_TOKEN"];
    if (githubToken) console.log("Using GITHUB_TOKEN for API requests");

    for (const entry of webuis) {
        const { url, sha256OfHtmlZip } = entry;
        try {
            // Parse "https://github.com/{owner}/{repo}/releases/tag/{tag}"
            const match = url.match(/github\.com\/([^/]+\/[^/]+)\/releases\/tag\/(.+)$/);
            if (!match) {
                console.warn(`Warning: Could not parse GitHub release URL: ${url}. Skipping.`);
                continue;
            }
            const [, ownerRepo, tag] = match;

            const headers = githubToken ? { authorization: `Bearer ${githubToken}` } : undefined;
            const releaseReq = await fetch(`https://api.github.com/repos/${ownerRepo}/releases/tags/${tag}`, { headers });
            if (!releaseReq.ok) {
                console.warn(`Warning: Failed to fetch release for ${ownerRepo}@${tag}, status ${releaseReq.status}. Skipping.`);
                continue;
            }

            const release = await releaseReq.json();
            const htmlZipAsset = release.assets.find((asset) => asset.name.includes("html"));
            if (!htmlZipAsset) {
                console.warn(`Warning: No HTML zip asset found in ${ownerRepo}@${tag}. Skipping.`);
                continue;
            }

            const zipfilePath = path.join(dstOfWebui, htmlZipAsset.name);
            const downloadReq = await fetch(htmlZipAsset["browser_download_url"], { headers });
            if (!downloadReq.ok || !downloadReq.body) {
                console.warn(`Warning: Failed to download ${htmlZipAsset.name}, status ${downloadReq.status}. Skipping.`);
                continue;
            }

            const writer = createWriteStream(zipfilePath);
            await streamFinished(Readable.fromWeb(downloadReq.body).pipe(writer));
            writer.close();
            console.log(`Downloaded ${htmlZipAsset.name}`);

            // Verify SHA-256 checksum
            const fileBuffer = await fs.readFile(zipfilePath);
            const actualHash = createHash("sha256").update(fileBuffer).digest("hex");
            if (actualHash !== sha256OfHtmlZip) {
                await fs.rm(zipfilePath);
                console.error(
                    `ERROR: SHA-256 mismatch for ${htmlZipAsset.name}!\n` +
                        `  Expected: ${sha256OfHtmlZip}\n` +
                        `  Actual:   ${actualHash}\n` +
                        `This could indicate a supply chain attack. Aborting.`
                );
                process.exit(1);
            }
            console.log(`Verified SHA-256 checksum for ${htmlZipAsset.name}`);

            await decompress(zipfilePath, dstOfWebui);
            console.log(`Extracted ${htmlZipAsset.name}`);
            await fs.rm(zipfilePath);

            // Rename index.html to prevent access to unconfigured version
            const extractedDirName = htmlZipAsset.name.replace(".zip", "");
            const indexPath = path.join(dstOfWebui, extractedDirName, "index.html");
            const backupPath = path.join(dstOfWebui, extractedDirName, "index_backup_no_rpc.html");
            await fs.rename(indexPath, backupPath);
            console.log(`Downloaded ${ownerRepo}@${tag} successfully`);
        } catch (e) {
            console.warn(`Warning: Failed to process ${url}: ${e}. Skipping.`);
            continue;
        }
    }

    // Verify at least one web UI was downloaded
    const downloadedEntries = await fs.readdir(dstOfWebui, { withFileTypes: true });
    const webuiDirs = downloadedEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    if (webuiDirs.length === 0) {
        console.error("ERROR: No web UIs were downloaded. At least one web UI is required.");
        process.exit(1);
    }
    console.log(`Successfully downloaded ${webuiDirs.length} web UI(s):`, webuiDirs);
}

main().catch((err) => {
    console.warn(`Warning: postinstall webui download failed: ${err}`);
    // Don't fail the install for non-checksum errors
});
