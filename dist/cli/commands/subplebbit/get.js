"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const base_command_js_1 = require("../../base-command.js");
const remeda = tslib_1.__importStar(require("remeda"));
class Get extends base_command_js_1.BaseCommand {
    static description = "Fetch a local or remote subplebbit, and print its json in the terminal";
    static examples = [
        "plebbit subplebbit get plebmusic.eth",
        "plebbit subplebbit get 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu"
    ];
    static args = {
        address: core_1.Args.string({
            name: "address",
            required: true,
            description: "Address of the subplebbit address to fetch"
        })
    };
    async run() {
        const { args, flags } = await this.parse(Get);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        try {
            const sub = await plebbit.getSubplebbit(args.address);
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
exports.default = Get;
