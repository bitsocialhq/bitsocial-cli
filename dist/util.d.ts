export declare function getPlebbitLogger(): Promise<typeof import("@plebbit/plebbit-logger", { with: { "resolution-mode": "import" } }).default>;
export declare function getLanIpV4Address(): string | undefined;
export declare function loadKuboConfigFile(plebbitDataPath: string): Promise<any | undefined>;
export declare function parseMultiAddrKuboRpcToUrl(kuboMultiAddrString: string): Promise<import("url").URL>;
export declare function parseMultiAddrIpfsGatewayToUrl(ipfsGatewaymultiAddrString: string): Promise<import("url").URL>;
