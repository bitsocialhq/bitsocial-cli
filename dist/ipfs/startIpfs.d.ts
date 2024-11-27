import { ChildProcessWithoutNullStreams } from "child_process";
export declare function startIpfsNode(apiUrl: URL, gatewayUrl: URL, dataPath: string): Promise<ChildProcessWithoutNullStreams>;
