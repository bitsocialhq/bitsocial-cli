import { BaseCommand } from "../../base-command.js";
export default class Edit extends BaseCommand {
    static description: string;
    static args: {
        address: import("@oclif/core/interfaces").Arg<string, Record<string, unknown>>;
    };
    static examples: {
        description: string;
        command: string;
    }[];
    run(): Promise<void>;
}
