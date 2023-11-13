import { BaseCommand } from "../../../base-command.js";
export default class Set extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {
        role: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static args: {
        "sub-address": import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        "author-address": import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
