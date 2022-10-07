import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";

export type SubplebbitList = { address: string; started: boolean }[];

export type SharedSingleton = { plebbit: Plebbit };
