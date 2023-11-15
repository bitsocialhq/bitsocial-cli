import { Command } from "@oclif/core";
export default class Daemon extends Command {
    static description: string;
    static flags: {
        plebbitDataPath: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        plebbitRpcApiPort: import("@oclif/core/lib/interfaces").OptionFlag<number, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        ipfsApiPort: import("@oclif/core/lib/interfaces").OptionFlag<number, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        ipfsGatewayPort: import("@oclif/core/lib/interfaces").OptionFlag<number, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    static examples: string[];
    run(): Promise<void>;
}
