import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import { Subplebbit } from "@plebbit/plebbit-js/dist/node/subplebbit.js";

export type SubplebbitList = { address: string; started: boolean }[];

export type SharedSingleton = {
  plebbit: Plebbit;
  subs: Record<string, Subplebbit>;
};
