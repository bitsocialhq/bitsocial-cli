import { Command } from "@oclif/core";
export declare abstract class BaseCommand extends Command {
    static baseFlags: {
        plebbitRpcUrl: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    protected _connectToPlebbitRpc(plebbitRpcUrl: string): Promise<import("@plebbit/plebbit-js/dist/node/plebbit/plebbit.js", { with: { "resolution-mode": "import" } }).Plebbit>;
}
