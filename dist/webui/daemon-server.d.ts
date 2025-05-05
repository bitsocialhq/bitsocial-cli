export declare function startDaemonServer(rpcUrl: URL, ipfsGatewayUrl: URL, plebbitOptions: any): Promise<{
    rpcAuthKey: string;
    listedSub: string[];
    webuis: {
        name: string;
        endpointLocal: string;
        endpointRemote: string;
    }[];
    destroy: () => Promise<void>;
}>;
