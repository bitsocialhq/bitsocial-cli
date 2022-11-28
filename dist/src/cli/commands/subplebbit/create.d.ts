/// <reference types="node" />
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";
export default class Create extends BaseSubplebbitOptions {
    static description: string;
    static examples: {
        description: string;
        command: string;
    }[];
    static flags: {
        "signer.privateKey": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        "database.connection.filename": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        address: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        title: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        description: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        pubsubTopic: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        "suggested.primaryColor": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        "suggested.secondaryColor": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
        "suggested.avatarUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL | undefined>;
        "suggested.bannerUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL | undefined>;
        "suggested.backgroundUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL | undefined>;
        "suggested.language": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
