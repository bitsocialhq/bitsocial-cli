"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_js_1 = require("../../../util.js");
const base_command_js_1 = require("../../base-command.js");
const core_1 = require("@oclif/core");
class Stop extends base_command_js_1.BaseCommand {
    static description = "Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.";
    static strict = false; // To allow for variable length arguments
    static args = {
        addresses: core_1.Args.string({
            name: "addresses",
            required: true,
            description: "Addresses of subplebbits to stop. Separated by space"
        })
    };
    static examples = [
        "plebbit subplebbit stop plebbit.eth",
        "plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW"
    ];
    async run() {
        const { argv, flags } = await this.parse(Stop);
        const log = (await (0, util_js_1.getPlebbitLogger)())("plebbit-cli:commands:subplebbit:stop");
        log(`addresses: `, argv);
        log(`flags: `, flags);
        const addresses = argv;
        if (!Array.isArray(addresses))
            this.error(`Failed to parse addresses correctly (${addresses})`);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        for (const address of addresses) {
            await plebbit.plebbitRpcClient.stopSubplebbit(address);
            this.log(address);
        }
        await plebbit.destroy();
    }
}
exports.default = Stop;
