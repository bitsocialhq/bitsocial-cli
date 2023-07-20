/// <reference types="node" />
import { Command } from "@oclif/core";
import { URL } from "url";
export declare abstract class BaseCommand extends Command {
    static baseFlags: {
        apiUrl: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<URL, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    private _isDaemonUp;
    stopIfDaemonIsDown: (apiUrl: string) => Promise<void>;
}
