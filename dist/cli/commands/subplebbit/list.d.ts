import { BaseCommand } from "../../base-command.js";
export default class List extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {
        columns: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        csv: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        extended: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        filter: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        'no-header': import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        'no-truncate': import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        sort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        quiet: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
