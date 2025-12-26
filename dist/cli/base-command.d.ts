import { Command } from "@oclif/core";
import Plebbit from "@plebbit/plebbit-js";
type PlebbitInstance = Awaited<ReturnType<typeof Plebbit>>;
export declare abstract class BaseCommand extends Command {
    static baseFlags: {
        plebbitRpcUrl: import("@oclif/core/interfaces").OptionFlag<import("url").URL, import("@oclif/core/interfaces").CustomOptions>;
    };
    protected _connectToPlebbitRpc(plebbitRpcUrl: string): Promise<PlebbitInstance>;
}
export {};
