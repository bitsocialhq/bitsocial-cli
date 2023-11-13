/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from "child_process";
export declare function startIpfsNode(apiPortNumber: number, gatewayPortNumber: number): Promise<ChildProcessWithoutNullStreams>;
