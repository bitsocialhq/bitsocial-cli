"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlebbitLogger = getPlebbitLogger;
exports.getLanIpV4Address = getLanIpV4Address;
exports.loadKuboConfigFile = loadKuboConfigFile;
exports.parseMultiAddrKuboRpcToUrl = parseMultiAddrKuboRpcToUrl;
exports.parseMultiAddrIpfsGatewayToUrl = parseMultiAddrIpfsGatewayToUrl;
exports.mergeDeep = mergeDeep;
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
/**
 * Custom merge function that implements CLI-specific merge behavior.
 * This matches the expected behavior from the test suite.
 */
function mergeDeep(target, source) {
    function isObject(item) {
        return item && typeof item === "object" && !Array.isArray(item);
    }
    function isPlainObject(item) {
        return isObject(item) && item.constructor === Object;
    }
    // Handle arrays with CLI-specific behavior
    if (Array.isArray(target) && Array.isArray(source)) {
        // Check if source is sparse (has holes/empty items) - indicates indexed assignment like --rules[2]
        const sourceHasHoles = source.length !== Object.keys(source).length;
        if (sourceHasHoles) {
            // Sparse array: merge by index, extending to accommodate both arrays
            const maxLength = Math.max(target.length, source.length);
            const result = new Array(maxLength);
            for (let i = 0; i < maxLength; i++) {
                if (i in source) {
                    if (i in target && isPlainObject(target[i]) && isPlainObject(source[i])) {
                        result[i] = mergeDeep(target[i], source[i]);
                    }
                    else {
                        result[i] = source[i];
                    }
                }
                else if (i in target) {
                    result[i] = target[i];
                }
                // If neither has this index, it remains undefined
            }
            return result;
        }
        else {
            // Dense array: CLI behavior is to extend the array to include both original and new values
            // This creates: [source[0], source[1], target[2], target[3], ...]
            const maxLength = target.length + source.length;
            const result = new Array(maxLength);
            // First, place source values at the beginning
            for (let i = 0; i < source.length; i++) {
                result[i] = source[i];
            }
            // Then, place target values at their original indices (beyond source length)
            for (let i = source.length; i < maxLength; i++) {
                const targetIndex = i; // Use the same index, not shifted
                if (targetIndex < target.length) {
                    result[i] = target[targetIndex];
                }
                else {
                    result[i] = undefined;
                }
            }
            return result;
        }
    }
    // Handle plain objects
    if (isPlainObject(target) && isPlainObject(source)) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (Array.isArray(target[key]) && Array.isArray(source[key])) {
                    result[key] = mergeDeep(target[key], source[key]);
                }
                else if (isPlainObject(target[key]) && isPlainObject(source[key])) {
                    result[key] = mergeDeep(target[key], source[key]);
                }
                else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
    // If not both objects/arrays, source takes precedence
    return source;
}
