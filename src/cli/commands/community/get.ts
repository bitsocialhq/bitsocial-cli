import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";

import * as remeda from "remeda";

export default class Get extends BaseCommand {
    static override description = "Fetch a local or remote community, and print its json in the terminal";

    static override examples = [
        "bitsocial community get plebmusic.bso",
        "bitsocial community get 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu",
        "bitsocial community get --name my-community",
        "bitsocial community get --publicKey 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu"
    ];

    static override args = {
        address: Args.string({
            name: "address",
            required: false,
            description: "Address of the community to fetch"
        })
    };

    static override flags = {
        name: Flags.string({
            description: "Name of the community to fetch"
        }),
        publicKey: Flags.string({
            description: "Public key of the community to fetch"
        })
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Get);

        const lookupParam: Record<string, string> = {};
        if (args.address) lookupParam.address = args.address;
        if (flags.name) lookupParam.name = flags.name;
        if (flags.publicKey) lookupParam.publicKey = flags.publicKey;

        if (Object.keys(lookupParam).length === 0) {
            this.error("At least one of address argument, --name, or --publicKey must be provided");
        }

        const pkc = await this._connectToPkcRpc(flags.pkcRpcUrl.toString());
        try {
            const community = await pkc.getCommunity(lookupParam);
            const communityJson = JSON.parse(JSON.stringify(community));
            this.logJson({ posts: communityJson.posts, ...remeda.omit(communityJson, ["posts"]) }); // make sure posts is printed first, because most users won't look at it
        } catch (e) {
            console.error(e);
            await pkc.destroy();
            this.exit(1);
        }
        await pkc.destroy();
    }
}
