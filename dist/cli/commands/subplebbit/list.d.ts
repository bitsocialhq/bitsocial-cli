import { BaseCommand } from "../../base-command.js";
export default class List extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {
        quiet: import("@oclif/core/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
