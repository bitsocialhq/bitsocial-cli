import { CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions, SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/types.js";
export interface CreateSubplebbitOptions extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    privateKeyPath?: string;
}
export interface EditSubplebbitOptions extends Pick<SubplebbitEditOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
}
