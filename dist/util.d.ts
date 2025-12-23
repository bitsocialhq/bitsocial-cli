export declare function getPlebbitLogger(): Promise<typeof import("@plebbit/plebbit-logger").default>;
export declare function getLanIpV4Address(): string | undefined;
export declare function loadKuboConfigFile(plebbitDataPath: string): Promise<any | undefined>;
export declare function parseMultiAddrKuboRpcToUrl(kuboMultiAddrString: string): Promise<import("url").URL>;
export declare function parseMultiAddrIpfsGatewayToUrl(ipfsGatewaymultiAddrString: string): Promise<import("url").URL>;
/**
 * Custom merge function that implements CLI-specific merge behavior.
 * This matches the expected behavior from the test suite.
 */
export declare function mergeDeep(target: any, source: any): any;
