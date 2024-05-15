import type {
    CreateNewLocalSubplebbitUserOptions as PlebbitCreateSubplebbitOptions
    //@ts-expect-error
} from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";

// TODO add subplebbit.settings
export interface CliCreateSubplebbitOptions
    extends Pick<
        PlebbitCreateSubplebbitOptions,
        "title" | "description" | "suggested" | "settings" | "features" | "roles" | "rules" | "flairs"
    > {
    privateKeyPath?: string;
}
