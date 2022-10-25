import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit.js";
import { CreateSubplebbitOptions as PlebbitCreateSubplebbitOptions, SignerType } from "@plebbit/plebbit-js/dist/node/types.js";

export type SubplebbitList = { address: string; started: boolean }[];

// 'plebbit' root command options, will be included in all action functions for commands
export interface BasePlebbitOptions {
    plebbitApiUrl: string;
}

export interface DaemonOptions {
    plebbitDataPath: string;
    plebbitApiPort: string;
    ipfsApiPort: string;
    ipfsGatewayPort: string;
}

export interface ListSubplebbitOptions extends BasePlebbitOptions {
    quiet: boolean;
}

// TODO add subplebbit.settings
export interface CreateSubplebbitOptions
    extends BasePlebbitOptions,
        Pick<PlebbitCreateSubplebbitOptions, "address" | "title" | "description" | "pubsubTopic" | "suggested"> {
    prettyPrint: boolean;
    signer?: Pick<SignerType, "privateKey">;
    database?: { connection: { filename: string } };
}
export type SharedSingleton = {
    plebbit: Plebbit;
    subs: Record<string, Subplebbit>;
};
