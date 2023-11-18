import { BaseCommand } from "../../base-command.js";
export default class Create extends BaseCommand {
    static description: string;
    static examples: {
        description: string;
        command: string;
    }[];
    static flags: {
        privateKeyPath: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
