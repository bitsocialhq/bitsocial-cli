import type { CreateNewLocalSubplebbitUserOptions as PlebbitCreateSubplebbitOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
export interface CliCreateSubplebbitOptions extends Pick<PlebbitCreateSubplebbitOptions, "title" | "description" | "suggested" | "settings" | "features" | "roles" | "rules" | "flairs"> {
    privateKeyPath?: string;
}
