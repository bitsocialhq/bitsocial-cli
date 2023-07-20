import { BaseCommand } from "../../base-command.js";
export default class Stop extends BaseCommand {
    static description: string;
    static strict: boolean;
    static args: {
        addresses: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    static examples: string[];
    run(): Promise<void>;
}
