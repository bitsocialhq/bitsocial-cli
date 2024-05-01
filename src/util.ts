import os from "os";

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
