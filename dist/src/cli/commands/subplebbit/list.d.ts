import { BaseCommand } from "../../base-command.js";
export default class List extends BaseCommand {
    static description: string;
    static examples: never[];
    static flags: {
        columns: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        sort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        filter: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        csv: import("@oclif/core/lib/interfaces/parser.js").Flag<boolean>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        extended: import("@oclif/core/lib/interfaces/parser.js").Flag<boolean>;
        'no-truncate': import("@oclif/core/lib/interfaces/parser.js").Flag<boolean>;
        'no-header': import("@oclif/core/lib/interfaces/parser.js").Flag<boolean>;
        quiet: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
