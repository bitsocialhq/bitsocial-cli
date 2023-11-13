"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../base-command.js");
const os_1 = require("os");
class List extends base_command_js_1.BaseCommand {
    async run() {
        const { flags } = await this.parse(List);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:list");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const subs = await plebbit.listSubplebbits();
        if (flags.quiet) {
            this.log(subs.join(os_1.EOL));
            return;
        }
        else {
            const subsWithStarted = await Promise.all(subs.map(async (subAddress) => {
                const subInstance = await plebbit.createSubplebbit({ address: subAddress });
                return { address: subInstance.address, started: subInstance.startedState !== "stopped" };
            }));
            core_1.ux.table(subsWithStarted, { address: {}, started: {} }, {
                printLine: this.log.bind(this),
                ...flags,
                sort: "-started"
            });
        }
        await plebbit.destroy();
    }
}
List.description = "List your subplebbits";
List.examples = [];
List.flags = {
    quiet: core_1.Flags.boolean({ char: "q", summary: "Only display subplebbit addresses" }),
    ...core_1.ux.table.flags()
};
exports.default = List;
