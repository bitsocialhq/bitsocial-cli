import {
    CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions,
    SignerType,
    SubplebbitEditOptions
} from "@plebbit/plebbit-js/dist/node/types.js";

// TODO add subplebbit.settings
export interface CreateSubplebbitOptions
    extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    signer?: Pick<SignerType, "privateKey">;
    database?: { connection: { filename: string } };
}

export interface EditSubplebbitOptions
    extends Pick<SubplebbitEditOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {}
