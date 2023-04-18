import { SharedSingleton } from "./types.js";
export declare let sharedSingleton: SharedSingleton;
export declare function startApi(plebbitApiPort: number, ipfsApiEndpoint: string, ipfsPubsubApiEndpoint: string, plebbitDataPath: string, seedSubs: string[] | undefined): Promise<void>;
