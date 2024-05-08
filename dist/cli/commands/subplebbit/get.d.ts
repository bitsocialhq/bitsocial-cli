import { BaseCommand } from "../../base-command.js";
export default class Get extends BaseCommand {
    static description: string;
    static examples: string[];
    static args: {
        address: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
