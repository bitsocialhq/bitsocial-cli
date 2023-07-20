/// <reference types="node" />
import { BaseCommand } from "./base-command.js";
export default abstract class BaseSubplebbitOptions extends BaseCommand {
    static baseSubplebbitFlags: {
        title: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        description: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        pubsubTopic: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "suggested.primaryColor": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "suggested.secondaryColor": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "suggested.avatarUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "suggested.bannerUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "suggested.backgroundUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("url").URL | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "suggested.language": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        "settings.fetchThumbnailUrls": import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        "settings.fetchThumbnailUrlsProxyUrl": import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
}
