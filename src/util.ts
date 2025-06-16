import os from "os";
import path from "path";
import fs from "fs";
import * as fsPromises from "fs/promises";

export async function getPlebbitLogger() {
    const Logger = await import("@plebbit/plebbit-logger");
    return Logger.default;
}

export function getLanIpV4Address(): string | undefined {
    const allInterfaces = os.networkInterfaces();
    for (const k in allInterfaces) {
        const specificInterfaceInfos = allInterfaces[k];
        if (!specificInterfaceInfos) continue;

        const lanAddress: string | undefined = specificInterfaceInfos.filter((info) => info.family === "IPv4" && !info.internal)[0]
            ?.address;
        if (lanAddress) return lanAddress;
    }
    return undefined;
}

export async function loadKuboConfigFile(plebbitDataPath: string): Promise<any | undefined> {
    const kuboConfigPath = path.join(plebbitDataPath, ".ipfs-plebbit-cli", "config");

    if (!fs.existsSync(kuboConfigPath)) return undefined;

    const kuboConfig = JSON.parse((await fsPromises.readFile(kuboConfigPath)).toString());
    return kuboConfig;
}

async function parseMultiAddr(multiAddrString: string) {
    const module = await import("@multiformats/multiaddr");
    return module.multiaddr(multiAddrString);
}

export async function parseMultiAddrKuboRpcToUrl(kuboMultiAddrString: string) {
    const multiAddrObj = await parseMultiAddr(kuboMultiAddrString);
    return new URL(`http://${multiAddrObj.nodeAddress().address}:${multiAddrObj.nodeAddress().port}/api/v0`);
}

export async function parseMultiAddrIpfsGatewayToUrl(ipfsGatewaymultiAddrString: string) {
    const multiAddrObj = await parseMultiAddr(ipfsGatewaymultiAddrString);
    return new URL(`http://${multiAddrObj.nodeAddress().address}:${multiAddrObj.nodeAddress().port}`);
}

/**
 * Custom merge function that implements CLI-specific merge behavior.
 * This matches the expected behavior from the test suite.
 */
export function mergeDeep(target: any, source: any): any {
    function isObject(item: any): boolean {
        return item && typeof item === "object" && !Array.isArray(item);
    }

    function isPlainObject(item: any): boolean {
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
                    } else {
                        result[i] = source[i];
                    }
                } else if (i in target) {
                    result[i] = target[i];
                }
                // If neither has this index, it remains undefined
            }

            return result;
        } else {
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
                } else {
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
                } else if (isPlainObject(target[key]) && isPlainObject(source[key])) {
                    result[key] = mergeDeep(target[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    // If not both objects/arrays, source takes precedence
    return source;
}
