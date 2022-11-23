import { Flags } from "@oclif/core";
import { BaseCommand } from "./base-command.js";
export default class BaseSubplebbitOptions extends BaseCommand {
}
// TODO implement roles,rules, features, flairs
BaseSubplebbitOptions.baseSubplebbitFlags = {
    address: Flags.string({ summary: "Address of the subplebbit. Can be used to retrieve an already existing subplebbit" }),
    title: Flags.string({ summary: "Title of the subplebbit" }),
    description: Flags.string({ summary: "Description of the subplebbit" }),
    pubsubTopic: Flags.string({ summary: "The string to publish to in the pubsub, a public key of the subplebbit owner's choice" }),
    "suggested.primaryColor": Flags.string({ sumamry: "Primary color of the subplebbit in hex" }),
    "suggested.secondaryColor": Flags.string({ summary: "Secondary color of the subplebbit in hex" }),
    "suggested.avatarUrl": Flags.url({ summary: "The URL of the subplebbit's avatar" }),
    "suggested.bannerUrl": Flags.url({ summary: "The URL of the subplebbit's banner" }),
    "suggested.backgroundUrl": Flags.url({ summary: "The URL of the subplebbit's background" }),
    "suggested.language": Flags.string({ summary: "The language of the subplebbit" })
    // "settings.fetchThumbnailUrls": Flags.boolean({
    //     summary: "Fetch the thumbnail URLs of comments comment.link property, could reveal the IP address of the subplebbit node",
    //     default: false
    // }),
    // "settings.fetchThumbnailUrlsProxyUrl": Flags.url({ summary: "The HTTP proxy URL used to fetch thumbnail URLs" })
};
