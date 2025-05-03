"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlebbitLogger = getPlebbitLogger;
exports.getLanIpV4Address = getLanIpV4Address;
exports.loadKuboConfigFile = loadKuboConfigFile;
exports.parseMultiAddrKuboRpcToUrl = parseMultiAddrKuboRpcToUrl;
exports.parseMultiAddrIpfsGatewayToUrl = parseMultiAddrIpfsGatewayToUrl;
const tslib_1 = require("tslib");
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const fsPromises = tslib_1.__importStar(require("fs/promises"));
async function getPlebbitLogger() {
    const Logger = await import("@plebbit/plebbit-logger");
    return Logger.default;
}
function getLanIpV4Address() {
    const allInterfaces = os_1.default.networkInterfaces();
    for (const k in allInterfaces) {
        const specificInterfaceInfos = allInterfaces[k];
        if (!specificInterfaceInfos)
            continue;
        const lanAddress = specificInterfaceInfos.filter((info) => info.family === "IPv4" && !info.internal)[0]
            ?.address;
        if (lanAddress)
            return lanAddress;
    }
    return undefined;
}
async function loadKuboConfigFile(plebbitDataPath) {
    const kuboConfigPath = path_1.default.join(plebbitDataPath, ".ipfs-plebbit-cli", "config");
    if (!fs_1.default.existsSync(kuboConfigPath))
        return undefined;
    const kuboConfig = JSON.parse((await fsPromises.readFile(kuboConfigPath)).toString());
    return kuboConfig;
}
async function parseMultiAddr(multiAddrString) {
    const module = await import("@multiformats/multiaddr");
    return module.multiaddr(multiAddrString);
}
async function parseMultiAddrKuboRpcToUrl(kuboMultiAddrString) {
    const multiAddrObj = await parseMultiAddr(kuboMultiAddrString);
    return new URL(`http://${multiAddrObj.nodeAddress().address}:${multiAddrObj.nodeAddress().port}/api/v0`);
}
async function parseMultiAddrIpfsGatewayToUrl(ipfsGatewaymultiAddrString) {
    const multiAddrObj = await parseMultiAddr(ipfsGatewaymultiAddrString);
    return new URL(`http://${multiAddrObj.nodeAddress().address}:${multiAddrObj.nodeAddress().port}`);
}
