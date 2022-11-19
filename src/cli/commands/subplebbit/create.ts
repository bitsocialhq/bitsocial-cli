import { Flags } from "@oclif/core";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes } from "../../../api/responseStatuses.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";

export default class Create extends BaseCommand {
    static override description = "Create a subplebbit";

    static override examples = [];

    // TODO implement roles, flairs flag
    static override flags = {
        address: Flags.string({ summary: "Address of the subplebbit. Can be used to retrieve an already existing subplebbit" }),
        "signer.privateKey": Flags.string({
            summary:
                "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). Only needed if you're creating a new subplebbit"
        }),
        "database.connection.filename": Flags.file({ exists: false, summary: "Path to the subplebbit sqlite file" }),
        title: Flags.string({ summary: "Title of the subplebbit" }),
        description: Flags.string({ summary: "Description of the subplebbit" }),
        pubsubTopic: Flags.string({ summary: "The string to publish to in the pubsub, a public key of the subplebbit owner's choice" }),
        "suggested.primaryColor": Flags.string({ sumamry: "Primary color of the subplebbit in hex" }),
        "suggested.secondaryColor": Flags.string({ summary: "Secondary color of the subplebbit in hex" }),
        "suggested.avatarUrl": Flags.url({ summary: "The URL of the subplebbit's avatar" }),
        "suggested.bannerUrl": Flags.url({ summary: "The URL of the subplebbit's banner" }),
        "suggested.backgroundUrl": Flags.url({ summary: "The URL of the subplebbit's background" }),
        "suggested.language": Flags.string({ summary: "The language of the subplebbit" }),
        "settings.fetchThumbnailUrls": Flags.boolean({
            summary: "Fetch the thumbnail URLs of comments comment.link property, could reveal the IP address of the subplebbit node"
        }),
        "settings.fetchThumbnailUrlsProxyUrl": Flags.url({ summary: "The HTTP proxy URL used to fetch thumbnail URLs" })
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Create);

        const log = Logger("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions = lodash.omit(flags, ["apiUrl"]);

        const res = await fetch(`${flags.apiUrl}/subplebbit/create`, {
            body: JSON.stringify(createOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED) {
            // TODO, status text is not enough to explain error. Include more info
            this.logToStderr(res.statusText);
            this.exit(1);
        }

        this.log(this.toSuccessJson(<SubplebbitType>await res.json()));
    }
}
