import { Args } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";
import * as remeda from "remeda";
export default class Get extends BaseCommand {
    static description = "Fetch a local or remote subplebbit, and print its json in the terminal";
    static examples = [
        "plebbit subplebbit get plebmusic.eth",
        "plebbit subplebbit get 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu"
    ];
    static args = {
        address: Args.string({
            name: "address",
            required: true,
            description: "Address of the subplebbit address to fetch"
        })
    };
    async run() {
        const { args, flags } = await this.parse(Get);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        try {
            const sub = await plebbit.getSubplebbit({ address: args.address });
            const subJson = JSON.parse(JSON.stringify(sub));
            this.logJson({ posts: subJson.posts, ...remeda.omit(subJson, ["posts"]) }); // make sure posts is printed first, because most users won't look at it
        }
        catch (e) {
            console.error(e);
            await plebbit.destroy();
            this.exit(1);
        }
        await plebbit.destroy();
    }
}
