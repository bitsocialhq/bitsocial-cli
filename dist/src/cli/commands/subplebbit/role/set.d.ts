import { BaseCommand } from "../../../base-command.js";
export default class Set extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {
        role: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<"owner" | "admin" | "moderator">;
    };
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    run(): Promise<void>;
}
