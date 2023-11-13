"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../base-command.js");
const core_1 = require("@oclif/core");
class Stop extends base_command_js_1.BaseCommand {
    async run() {
        const { argv, flags } = await this.parse(Stop);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:stop");
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
Stop.description = "Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.";
Stop.strict = false; // To allow for variable length arguments
Stop.args = {
    addresses: core_1.Args.string({
        name: "addresses",
        required: true,
        description: "Addresses of subplebbits to stop. Separated by space"
    })
};
Stop.examples = [
    "plebbit subplebbit stop plebbit.eth",
    "plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW"
];
exports.default = Stop;
