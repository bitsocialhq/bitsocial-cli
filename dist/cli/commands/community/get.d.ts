import { BaseCommand } from "../../base-command.js";
export default class Get extends BaseCommand {
    static description: string;
    static examples: string[];
    static args: {
        address: import("@oclif/core/interfaces").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
