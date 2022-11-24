import { Command } from "@oclif/core";
export default class Daemon extends Command {
    static description: string;
    static flags: {
        plebbitDataPath: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string>;
        plebbitApiPort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number>;
        ipfsApiPort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number>;
        ipfsGatewayPort: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number>;
    };
    static examples: never[];
    run(): Promise<void>;
}
