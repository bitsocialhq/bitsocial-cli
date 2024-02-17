import type { CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
export interface CliCreateSubplebbitOptions extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    privateKeyPath?: string;
}
