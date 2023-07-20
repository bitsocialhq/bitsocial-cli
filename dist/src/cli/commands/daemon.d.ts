import { Command } from "@oclif/core";
export default class Daemon extends Command {
    static description: string;
    static flags: {
        plebbitDataPath: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        seed: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        seedSubs: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string[], import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        plebbitApiPort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        ipfsApiPort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        ipfsGatewayPort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static examples: string[];
    run(): Promise<void>;
}
