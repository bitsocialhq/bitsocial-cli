export declare function startDaemonServer(daemonPort: number, ipfsGatewayPort: number, ipfsApiEndpoint: string, plebbitDataPath: string): Promise<{
    rpcAuthKey: string;
    listedSub: string[];
    webuis: {
        name: string;
        endpointLocal: string;
        endpointRemote: string;
    }[];
}>;
