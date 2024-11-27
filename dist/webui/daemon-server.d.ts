import type { InputPlebbitOptions } from "@plebbit/plebbit-js/dist/node/types";
export declare function startDaemonServer(rpcUrl: URL, ipfsGatewayUrl: URL, plebbitOptions: InputPlebbitOptions): Promise<{
    rpcAuthKey: string;
    listedSub: string[];
    webuis: {
        name: string;
        endpointLocal: string;
        endpointRemote: string;
    }[];
}>;
