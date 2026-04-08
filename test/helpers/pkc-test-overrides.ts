type PKCConnectOverride = (pkcRpcUrl: string) => Promise<unknown>;

type PKCConnectOverrideGlobal = {
    __PKC_RPC_CONNECT_OVERRIDE?: PKCConnectOverride;
};

export const setPkcRpcConnectOverride = (override: PKCConnectOverride) => {
    (globalThis as PKCConnectOverrideGlobal).__PKC_RPC_CONNECT_OVERRIDE = override;
};

export const clearPkcRpcConnectOverride = () => {
    delete (globalThis as PKCConnectOverrideGlobal).__PKC_RPC_CONNECT_OVERRIDE;
};
