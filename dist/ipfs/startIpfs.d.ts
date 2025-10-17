import { ChildProcessWithoutNullStreams } from "child_process";
export declare function mergeCliDefaultsIntoIpfsConfig(log: any, ipfsConfigPath: string, apiUrl: URL, gatewayUrl: URL): Promise<void>;
export declare function startKuboNode(apiUrl: URL, gatewayUrl: URL, dataPath: string): Promise<ChildProcessWithoutNullStreams>;
