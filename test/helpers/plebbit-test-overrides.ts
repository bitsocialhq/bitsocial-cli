type PlebbitConnectOverride = (plebbitRpcUrl: string) => Promise<unknown>;

type PlebbitConnectOverrideGlobal = {
    __PLEBBIT_RPC_CONNECT_OVERRIDE?: PlebbitConnectOverride;
};

export const setPlebbitRpcConnectOverride = (override: PlebbitConnectOverride) => {
    (globalThis as PlebbitConnectOverrideGlobal).__PLEBBIT_RPC_CONNECT_OVERRIDE = override;
};

export const clearPlebbitRpcConnectOverride = () => {
    delete (globalThis as PlebbitConnectOverrideGlobal).__PLEBBIT_RPC_CONNECT_OVERRIDE;
};
