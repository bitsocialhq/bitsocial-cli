import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { getPlebbitLogger } from "../util";
import decompress from "decompress";
import prependFile from "prepend-file";
import { finished as streamFinished } from "stream/promises";
import { randomBytes } from "crypto";
import express from "express";

async function _downloadWebuiIfNeeded(plebbitDataPath: string, webuiName: string): Promise<string> {
    const log = (await getPlebbitLogger())("plebbit-cli:daemon-server:_downloadWebuiIfNeeded");
    // webui is defaulted to seedit for now
    const webuiPath = path.join(plebbitDataPath, ".ipfs-cli-webui");
    await fs.mkdir(webuiPath, { recursive: true });
    const latestSeeditReleaseReq = await fetch(`https://api.github.com/repos/plebbit/${webuiName}/releases/latest`);
    if (!latestSeeditReleaseReq.ok)
        throw Error(
            `Failed to fetch the release of ${webuiName}, status code ${latestSeeditReleaseReq.status}, status text ${latestSeeditReleaseReq.statusText}`
        );
    const latestRelease = <any>await latestSeeditReleaseReq.json();
    const latestReleaseNameParsed = latestRelease.name.substring(1); // remove v
    log.trace(`Latest ${webuiName} release is: ${latestReleaseNameParsed}`);
    try {
        const dirsUnderWebui = await fs.readdir(webuiPath);
        // parse seedit directory name, and compare it with latest release version from github
        for (const webuiDir of dirsUnderWebui) {
            if (webuiDir.includes(webuiName)) {
                const versionParsed = webuiDir.split("-")[2];
                log.trace("current seedit version is", versionParsed);
                if (versionParsed !== latestReleaseNameParsed) {
                    log(`Discovered old ${webuiName}`, webuiDir, "Will proceed with updating webui", webuiName);
                    // remove old seedit directory
                    await fs.rmdir(webuiDir);
                } else return path.join(webuiPath, webuiDir);
            }
        }
    } catch (e) {}

    // we either didn't have the correct version of seedit, or no UI was downloaded before
    // download seedit
    // then add defaultPlebbitOptions

    const htmlZipAsset = latestRelease.assets.find((asset: any) => asset.name.includes("html"));
    log.trace(webuiName, "zip file url", htmlZipAsset["browser_download_url"]);
    const seeditHtmlRequest = await fetch(htmlZipAsset["browser_download_url"]);
    if (seeditHtmlRequest.ok && seeditHtmlRequest.body) {
        const zipfilePath = path.join(webuiPath, htmlZipAsset.name);
        const writer = createWriteStream(zipfilePath);
        await streamFinished(Readable.fromWeb(seeditHtmlRequest.body).pipe(writer));
        writer.close();
        log("Downloaded", webuiName, "webui successfully. Attempting to unzip");

        const unzippedDirectoryPath = zipfilePath.replace(".zip", "");

        await decompress(zipfilePath, webuiPath);
        log("Unzipped", webuiName);
        await fs.rm(zipfilePath);
        // add default plebbit options
        const indexHtmlPath = path.join(unzippedDirectoryPath, "index.html");

        const defaultRpcOptionString = `["ws://" + window.location.href.split('${webuiName}')[0]]`;
        const defaultOptionsString = `<script>window.defaultPlebbitOptions = {plebbitRpcClientsOptions: ${defaultRpcOptionString}}</script>`;
        await prependFile(indexHtmlPath, defaultOptionsString);
        log("Prepended the default options", defaultOptionsString, "to", indexHtmlPath);

        return unzippedDirectoryPath;
    } else throw Error(`Failed to fetch ${webuiName} html zip file ` + seeditHtmlRequest.status + " " + seeditHtmlRequest.statusText);
}

async function _generateRpcAuthKeyIfNotExisting(plebbitDataPath: string) {
    // generate plebbit rpc auth key if doesn't exist
    const plebbitRpcAuthKeyPath = path.join(plebbitDataPath, "auth-key");
    let plebbitRpcAuthKey: string;
    try {
        plebbitRpcAuthKey = await fs.readFile(plebbitRpcAuthKeyPath, "utf-8");
    } catch (e) {
        plebbitRpcAuthKey = randomBytes(32).toString("base64").replace(/[/+=]/g, "").substring(0, 40);
        await fs.writeFile(plebbitRpcAuthKeyPath, plebbitRpcAuthKey, { flag: "wx" });
    }
    return plebbitRpcAuthKey;
}

// The daemon server will host both RPC and webui on the same port
export async function startDaemonServer(daemonPort: number, ipfsApiEndpoint: string, plebbitDataPath: string, webuiName: string) {
    // Start plebbit-js RPC
    const log = (await getPlebbitLogger())("plebbit-cli:daemon:startDaemonServer");
    const rpcAuthKey = await _generateRpcAuthKeyIfNotExisting(plebbitDataPath);
    const PlebbitWsServer = await import("@plebbit/plebbit-js/dist/node/rpc/src/index.js");
    const rpcServer = await PlebbitWsServer.default.PlebbitWsServer({
        port: daemonPort,
        plebbitOptions: {
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            dataPath: plebbitDataPath
        },
        authKey: rpcAuthKey
    });

    const webuiDirPath = await _downloadWebuiIfNeeded(plebbitDataPath, webuiName);

    const webuiExpressApp = express();

    log(webuiDirPath);
    webuiExpressApp.use("/" + webuiName, express.static(webuiDirPath));

    // webuiExpressApp.use("/" + webuiName);

    webuiExpressApp.get("/" + webuiName, (req, res) => {
        res.sendFile(path.join(webuiDirPath, "index.html"));
    });

    const webuiPort = daemonPort + 1;

    const webuiListener = webuiExpressApp.listen(webuiPort);

    process.on("exit", async () => {
        await rpcServer.destroy();
        webuiListener.close();
    });
    const handlRpcExit = async (signal: NodeJS.Signals) => {
        log(`Detecting exit signal ${signal}, shutting down rpc server and webui`);
        await rpcServer.destroy();
        webuiListener.close();
        process.exit();
    };

    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handlRpcExit));

    return { rpcAuthKey, listedSub: await rpcServer.plebbit.listSubplebbits(), webuiPort };
}
