"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanIpV4Address = exports.getPlebbitLogger = void 0;
const tslib_1 = require("tslib");
const os_1 = tslib_1.__importDefault(require("os"));
async function getPlebbitLogger() {
    const Logger = await import("@plebbit/plebbit-logger");
    return Logger.default;
}
exports.getPlebbitLogger = getPlebbitLogger;
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
exports.getLanIpV4Address = getLanIpV4Address;
