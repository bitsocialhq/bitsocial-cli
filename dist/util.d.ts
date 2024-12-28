export declare function getPlebbitLogger(): Promise<typeof import("@plebbit/plebbit-logger", { with: { "resolution-mode": "import" } }).default>;
export declare function getLanIpV4Address(): string | undefined;
export declare function loadIpfsConfigFile(plebbitDataPath: string): Promise<any | undefined>;
export declare function parseMultiAddrIpfsApiToUrl(ipfsApimultiAddrString: string): Promise<import("url").URL>;
export declare function parseMultiAddrIpfsGatewayToUrl(ipfsGatewaymultiAddrString: string): Promise<import("url").URL>;
