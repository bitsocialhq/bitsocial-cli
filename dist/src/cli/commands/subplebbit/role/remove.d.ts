import { BaseCommand } from "../../../base-command.js";
export default class Remove extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {};
    static args: {
        "sub-address": import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        "author-address": import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
