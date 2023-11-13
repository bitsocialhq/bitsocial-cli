"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../base-command.js");
const core_1 = require("@oclif/core");
class Start extends base_command_js_1.BaseCommand {
    async run() {
        const { argv, flags } = await this.parse(Start);
        const addresses = argv;
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:start");
        log(`addresses: `, addresses);
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        for (const address of addresses) {
            await plebbit.plebbitRpcClient.startSubplebbit(address);
            this.log(address);
        }
        await plebbit.destroy();
    }
}
Start.description = "Start a subplebbit";
Start.strict = false; // To allow for variable length arguments
Start.args = {
    addresses: core_1.Args.string({
        name: "addresses",
        required: true,
        description: "Addresses of subplebbits to start. Separated by space"
    })
};
Start.examples = [];
exports.default = Start;
