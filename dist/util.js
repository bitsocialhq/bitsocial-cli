"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlebbitLogger = getPlebbitLogger;
exports.getLanIpV4Address = getLanIpV4Address;
const tslib_1 = require("tslib");
const os_1 = tslib_1.__importDefault(require("os"));
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
