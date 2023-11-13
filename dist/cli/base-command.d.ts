/// <reference types="node" />
import { Command } from "@oclif/core";
import { URL } from "url";
export declare abstract class BaseCommand extends Command {
    static baseFlags: {
        plebbitRpcApiUrl: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<URL, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    _connectToPlebbitRpc: (plebbitRpcApiUrl: string) => Promise<import("@plebbit/plebbit-js/dist/node/plebbit.js").Plebbit>;
}
