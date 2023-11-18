import {
    CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions,
    SubplebbitEditOptions
} from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";

// TODO add subplebbit.settings
export interface CliCreateSubplebbitOptions
    extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    privateKeyPath?: string;
}

