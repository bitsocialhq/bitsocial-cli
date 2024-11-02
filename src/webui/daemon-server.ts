import path from "path";
import fs from "fs/promises";
import { getPlebbitLogger } from "../util";
import { randomBytes } from "crypto";
import express from "express";

async function _writeModifiedIndexHtmlWithDefaultSettings(webuiPath: string, webuiName: string, ipfsGatewayPort: number) {
    const indexHtmlString = (await fs.readFile(path.join(webuiPath, "index.html"))).toString();
    const defaultRpcOptionString = `[window.location.origin.replace("https", "wss").replace("http", "ws") + window.location.pathname.split('/' + '${webuiName}')[0]]`;
    // Ipfs media only locally because ipfs gateway doesn't allow remote connections
    const defaultIpfsMedia = `if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")window.defaultMediaIpfsGatewayUrl = 'http://' + window.location.hostname + ':' + ${ipfsGatewayPort}`;
    const defaultOptionsString = `<script>window.defaultPlebbitOptions = {plebbitRpcClientsOptions: ${defaultRpcOptionString}};${defaultIpfsMedia};console.log(window.defaultPlebbitOptions, window.defaultMediaIpfsGatewayUrl)</script>`;

    const modifiedIndexHtmlFileName = `index_with_rpc_settings.html`;

    const modifiedIndexHtmlContent = "<!DOCTYPE html>" + defaultOptionsString + indexHtmlString.replace("<!DOCTYPE html>", "");

    await fs.writeFile(path.join(webuiPath, modifiedIndexHtmlFileName), modifiedIndexHtmlContent);

    return modifiedIndexHtmlFileName;
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
export async function startDaemonServer(daemonPort: number, ipfsGatewayPort: number, ipfsApiEndpoint: string, plebbitDataPath: string) {
    // Start plebbit-js RPC
    const log = (await getPlebbitLogger())("plebbit-cli:daemon:startDaemonServer");
    const webuiExpressApp = express();
    const httpServer = webuiExpressApp.listen(daemonPort);
    const rpcAuthKey = await _generateRpcAuthKeyIfNotExisting(plebbitDataPath);
    const PlebbitWsServer = await import("@plebbit/plebbit-js/dist/node/rpc/src/index.js");
    const rpcServer = await PlebbitWsServer.default.PlebbitWsServer({
        server: httpServer,
        plebbitOptions: {
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            dataPath: plebbitDataPath
        },
        authKey: rpcAuthKey
    });

    const webuisDir = path.join(__dirname, "..", "..", "dist", "webuis");

    const webUiNames = (await fs.readdir(webuisDir, { withFileTypes: true })).filter((file) => file.isDirectory()).map((file) => file.name);

    const webuis: { name: string; endpointLocal: string; endpointRemote: string }[] = [];
    log("Discovered webuis", webUiNames);
    for (const webuiNameWithVersion of webUiNames) {
        const webuiDirPath = path.join(webuisDir, webuiNameWithVersion);
        const webuiName = webuiNameWithVersion.split("-")[0]; // should be "seedit", "plebchan", "plebones"

        const modifiedIndexHtmlFileName = await _writeModifiedIndexHtmlWithDefaultSettings(webuiDirPath, webuiName, ipfsGatewayPort);

        const endpointLocal = `/${webuiName}`;
        webuiExpressApp.get(endpointLocal, (req, res, next) => {
            const isLocal = req.socket.localAddress && req.socket.localAddress === req.socket.remoteAddress;
            if (!isLocal) res.status(403).send("This endpoint does not exist for remote connections");
            else next();
        });
        webuiExpressApp.use(endpointLocal, express.static(webuiDirPath, { index: modifiedIndexHtmlFileName, cacheControl: false }));

        const endpointRemote = `/${rpcAuthKey}/${webuiName}`;
        webuiExpressApp.get(endpointRemote, (req, res, next) => {
            const isLocal = req.socket.localAddress && req.socket.localAddress === req.socket.remoteAddress;
            if (isLocal) res.redirect(`http://localhost:${daemonPort}${endpointLocal}`);
            else next();
        });
        webuiExpressApp.use(endpointRemote, express.static(webuiDirPath, { index: modifiedIndexHtmlFileName, cacheControl: false }));

        webuis.push({ name: webuiName, endpointLocal, endpointRemote });
    }

    process.on("exit", async () => {
        await rpcServer.destroy();
        httpServer.close();
    });
    const handlRpcExit = async (signal: NodeJS.Signals) => {
        log(`Detecting exit signal ${signal}, shutting down rpc server and webui`);
        await rpcServer.destroy();
        httpServer.close();
        process.exit();
    };

    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handlRpcExit));

    return { rpcAuthKey, listedSub: rpcServer.plebbit.subplebbits, webuis };
}
