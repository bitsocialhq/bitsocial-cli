import { Plebbit } from "@plebbit/plebbit-js/dist/node/plebbit.js";

export type SubplebbitList = { address: string; title: string; status: "running" | "starting" | "off" }[];

export type SharedSingleton = { plebbit: Plebbit };
