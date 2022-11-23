import { CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions, SignerType } from "@plebbit/plebbit-js/dist/node/types.js";
export interface CreateSubplebbitOptions extends Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    signer?: Pick<SignerType, "privateKey">;
    database?: {
        connection: {
            filename: string;
        };
    };
}
