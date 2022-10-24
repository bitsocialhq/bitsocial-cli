import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit.js";

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

export interface CreateSubplebbitOptions extends BasePlebbitOptions {
    createOptions: string; // options is a JSON string representing CreateSubplebbitOptions from plebbit-js
    prettyPrint: boolean;
}
export type SharedSingleton = {
    plebbit: Plebbit;
    subs: Record<string, Subplebbit>;
};
