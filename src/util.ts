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

export async function loadIpfsConfigFile(plebbitDataPath: string): Promise<any | undefined> {
    const ipfsFilePath = path.join(plebbitDataPath, ".ipfs-plebbit-cli", "config");

    if (!fs.existsSync(ipfsFilePath)) return undefined;

    const ipfsConfig = JSON.parse((await fsPromises.readFile(ipfsFilePath)).toString());
    return ipfsConfig;
}

async function parseMultiAddr(multiAddrString: string) {
    const module = await import("@multiformats/multiaddr");
    return module.multiaddr(multiAddrString);
}

export async function parseMultiAddrIpfsApiToUrl(ipfsApimultiAddrString: string) {
    const multiAddrObj = await parseMultiAddr(ipfsApimultiAddrString);
    return new URL(`http://${multiAddrObj.nodeAddress().address}:${multiAddrObj.nodeAddress().port}/api/v0`);
}

export async function parseMultiAddrIpfsGatewayToUrl(ipfsGatewaymultiAddrString: string) {
    const multiAddrObj = await parseMultiAddr(ipfsGatewaymultiAddrString);
    return new URL(`http://${multiAddrObj.nodeAddress().address}:${multiAddrObj.nodeAddress().port}`);
}
