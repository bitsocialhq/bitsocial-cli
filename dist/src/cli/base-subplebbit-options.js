"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const base_command_js_1 = require("./base-command.js");
class BaseSubplebbitOptions extends base_command_js_1.BaseCommand {
}
exports.default = BaseSubplebbitOptions;
// TODO implement roles,rules, features, flairs, settings
BaseSubplebbitOptions.baseSubplebbitFlags = {
    title: core_1.Flags.string({ summary: "Title of the subplebbit" }),
    description: core_1.Flags.string({ summary: "Description of the subplebbit" }),
    pubsubTopic: core_1.Flags.string({ summary: "The string to publish to in the pubsub, a public key of the subplebbit owner's choice" }),
    "suggested.primaryColor": core_1.Flags.string({ summary: "Primary color of the subplebbit in hex" }),
    "suggested.secondaryColor": core_1.Flags.string({ summary: "Secondary color of the subplebbit in hex" }),
    "suggested.avatarUrl": core_1.Flags.url({ summary: "The URL of the subplebbit's avatar" }),
    "suggested.bannerUrl": core_1.Flags.url({ summary: "The URL of the subplebbit's banner" }),
    "suggested.backgroundUrl": core_1.Flags.url({ summary: "The URL of the subplebbit's background" }),
    "suggested.language": core_1.Flags.string({ summary: "The language of the subplebbit" }),
    // Settings
    "settings.fetchThumbnailUrls": core_1.Flags.boolean({ "summary": "Fetch the thumbnail URLs of comments with comment.link property, could reveal the IP address of the subplebbit node" }),
    "settings.fetchThumbnailUrlsProxyUrl": core_1.Flags.string({ "summary": "The HTTP proxy URL used to fetch thumbnail URLs" })
};
