type PlebbitModule = Awaited<typeof import("@plebbit/plebbit-js", { with: { "resolution-mode": "import" } })>;
type PlebbitFactory = PlebbitModule["default"];


type PlebbitInstance = Awaited<ReturnType<PlebbitFactory>>;
export type SubplebbitInstance = Awaited<ReturnType<PlebbitInstance["createSubplebbit"]>>;


export type SubplebbitIpfsType = NonNullable<SubplebbitInstance["raw"]["subplebbitIpfs"]>;
export type CreateSubplebbitOptions = NonNullable<Parameters<PlebbitInstance["createSubplebbit"]>[0]>;
export type SubplebbitEditOptions = Parameters<SubplebbitInstance["edit"]>[0];
