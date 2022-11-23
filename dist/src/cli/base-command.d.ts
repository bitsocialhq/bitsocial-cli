/// <reference types="node" resolution-mode="require"/>
import { Command } from "@oclif/core";
import { URL } from "url";
export declare abstract class BaseCommand extends Command {
    static globalFlags: {
        apiUrl: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<URL>;
    };
    private _isDaemonUp;
    stopIfDaemonIsDown: (apiUrl: string) => Promise<void>;
}
