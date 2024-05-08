import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { finished as streamFinished } from "stream/promises";
import { Readable } from "stream";
import decompress from "decompress";

(async () => {
    const webuiGithubRepos = ["plebbit/seedit", "plebbit/plebones"];
    console.log("Github repos to download", webuiGithubRepos);
    const githubToken: string | undefined = process.env["GITHUB_TOKEN"]; // we need a token to avoid getting rate limited in CI
    if (githubToken) console.log("github token length", githubToken.length);
    const dstOfWebui = path.join(process.cwd(), "dist", "webuis");
    console.log("Destination of web uis will be", dstOfWebui);
    await fs.mkdir(dstOfWebui);

    for (const githubRepo of webuiGithubRepos) {
        const headers = githubToken ? { authorization: `Bearer ${githubToken}` } : undefined;
        const latestSeeditReleaseReq = await fetch(`https://api.github.com/repos/${githubRepo}/releases/latest`, {
            headers
        });
        if (!latestSeeditReleaseReq.ok)
            throw Error(
                `Failed to fetch the release of ${githubRepo}, status code ${latestSeeditReleaseReq.status}, status text ${latestSeeditReleaseReq.statusText}`
            );
        const latestRelease = <any>await latestSeeditReleaseReq.json();
        const htmlZipAsset = latestRelease.assets.find((asset: any) => asset.name.includes("html"));
        const htmlZipRequest = await fetch(htmlZipAsset["browser_download_url"], { headers });
        if (!htmlZipRequest.body)
            throw Error(
                `Failed to fetch ${htmlZipAsset["browser_download_url"]} html zip file ` +
                    htmlZipRequest.status +
                    " " +
                    htmlZipRequest.statusText
            );

        const zipfilePath = path.join(dstOfWebui, htmlZipAsset.name);
        const writer = createWriteStream(zipfilePath);
        await streamFinished(Readable.fromWeb(<any>htmlZipRequest.body).pipe(writer));
        writer.close();
        console.log("Downloaded", htmlZipAsset.name, "webui successfully. Attempting to unzip");

        await decompress(zipfilePath, dstOfWebui);
        console.log("Unzipped", zipfilePath);
        await fs.rm(zipfilePath);
        console.log(`Downloaded`, githubRepo, "successfully");
    }
})();
