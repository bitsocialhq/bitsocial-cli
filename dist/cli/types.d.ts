import { CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions, SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
export interface CliCreateSubplebbitOptions extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    privateKeyPath?: string;
}
export interface CliEditSubplebbitOptions extends Pick<SubplebbitEditOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
}
