import { ChildProcessWithoutNullStreams } from "child_process";
export declare function startKuboNode(apiUrl: URL, gatewayUrl: URL, dataPath: string): Promise<ChildProcessWithoutNullStreams>;
