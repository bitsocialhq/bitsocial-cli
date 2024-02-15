import type {
    CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions,
    SubplebbitEditOptions, //@ts-expect-error
} from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";

// TODO add subplebbit.settings
export interface CliCreateSubplebbitOptions
    extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested" > {
    privateKeyPath?: string;
}

