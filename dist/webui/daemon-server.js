"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDaemonServer = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const util_1 = require("../util");
const crypto_1 = require("crypto");
const express_1 = tslib_1.__importDefault(require("express"));
async function _writeModifiedIndexHtmlWithDefaultSettings(webuiPath, webuiName, ipfsGatewayPort) {
    const indexHtmlString = (await promises_1.default.readFile(path_1.default.join(webuiPath, "index.html"))).toString();
    const defaultRpcOptionString = `[window.location.origin.replace("https", "wss").replace("http", "ws") + window.location.pathname.split('/' + '${webuiName}')[0]]`;
    // Ipfs media only locally because ipfs gateway doesn't allow remote connections
    const defaultIpfsMedia = `if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")window.defaultMediaIpfsGatewayUrl = 'http://' + window.location.hostname + ':' + ${ipfsGatewayPort}`;
    const defaultOptionsString = `<script>window.defaultPlebbitOptions = {plebbitRpcClientsOptions: ${defaultRpcOptionString}};${defaultIpfsMedia};console.log(window.defaultPlebbitOptions, window.defaultMediaIpfsGatewayUrl)</script>`;
    const modifiedIndexHtmlFileName = `index_with_rpc_settings.html`;
    const modifiedIndexHtmlContent = "<!DOCTYPE html>" + defaultOptionsString + indexHtmlString.replace("<!DOCTYPE html>", "");
    await promises_1.default.writeFile(path_1.default.join(webuiPath, modifiedIndexHtmlFileName), modifiedIndexHtmlContent);
    return modifiedIndexHtmlFileName;
}
async function _generateRpcAuthKeyIfNotExisting(plebbitDataPath) {
    // generate plebbit rpc auth key if doesn't exist
    const plebbitRpcAuthKeyPath = path_1.default.join(plebbitDataPath, "auth-key");
    let plebbitRpcAuthKey;
    try {
        plebbitRpcAuthKey = await promises_1.default.readFile(plebbitRpcAuthKeyPath, "utf-8");
    }
    catch (e) {
        plebbitRpcAuthKey = (0, crypto_1.randomBytes)(32).toString("base64").replace(/[/+=]/g, "").substring(0, 40);
        await promises_1.default.writeFile(plebbitRpcAuthKeyPath, plebbitRpcAuthKey, { flag: "wx" });
    }
    return plebbitRpcAuthKey;
}
// The daemon server will host both RPC and webui on the same port
async function startDaemonServer(daemonPort, ipfsGatewayPort, ipfsApiEndpoint, plebbitDataPath) {
    // Start plebbit-js RPC
    const log = (await (0, util_1.getPlebbitLogger)())("plebbit-cli:daemon:startDaemonServer");
    const webuiExpressApp = (0, express_1.default)();
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
    const webuisDir = path_1.default.join(process.cwd(), "dist", "webuis");
    const webUiNames = (await promises_1.default.readdir(webuisDir, { withFileTypes: true })).filter((file) => file.isDirectory()).map((file) => file.name);
    const webuis = [];
    log("Discovered webuis", webUiNames);
    for (const webuiNameWithVersion of webUiNames) {
        const webuiDirPath = path_1.default.join(webuisDir, webuiNameWithVersion);
        const webuiName = webuiNameWithVersion.split("-")[0]; // should be "seedit", "plebchan", "plebones"
        const modifiedIndexHtmlFileName = await _writeModifiedIndexHtmlWithDefaultSettings(webuiDirPath, webuiName, ipfsGatewayPort);
        const endpointLocal = `/${webuiName}`;
        webuiExpressApp.get(endpointLocal, (req, res, next) => {
            const isLocal = req.socket.localAddress && req.socket.localAddress === req.socket.remoteAddress;
            if (!isLocal)
                res.status(403).send("This endpoint does not exist for remote connections");
            else
                next();
        });
        webuiExpressApp.use(endpointLocal, express_1.default.static(webuiDirPath, { index: modifiedIndexHtmlFileName, cacheControl: false }));
        const endpointRemote = `/${rpcAuthKey}/${webuiName}`;
        webuiExpressApp.get(endpointRemote, (req, res, next) => {
            const isLocal = req.socket.localAddress && req.socket.localAddress === req.socket.remoteAddress;
            if (isLocal)
                res.redirect(`http://localhost:${daemonPort}${endpointLocal}`);
            else
                next();
        });
        webuiExpressApp.use(endpointRemote, express_1.default.static(webuiDirPath, { index: modifiedIndexHtmlFileName, cacheControl: false }));
        webuis.push({ name: webuiName, endpointLocal, endpointRemote });
    }
    process.on("exit", async () => {
        await rpcServer.destroy();
        httpServer.close();
    });
    const handlRpcExit = async (signal) => {
        log(`Detecting exit signal ${signal}, shutting down rpc server and webui`);
        await rpcServer.destroy();
        httpServer.close();
        process.exit();
    };
    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handlRpcExit));
    return { rpcAuthKey, listedSub: await rpcServer.plebbit.listSubplebbits(), webuis };
}
exports.startDaemonServer = startDaemonServer;
