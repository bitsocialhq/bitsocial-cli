"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const base_command_js_1 = require("../../base-command.js");
const os_1 = require("os");
const util_js_1 = require("../../../util.js");
class List extends base_command_js_1.BaseCommand {
    static description = "List your subplebbits";
    static examples = [];
    static flags = {
        quiet: core_1.Flags.boolean({ char: "q", summary: "Only display subplebbit addresses" }),
        ...core_1.ux.table.flags()
    };
    async run() {
        const { flags } = await this.parse(List);
        const log = (await (0, util_js_1.getPlebbitLogger)())("plebbit-cli:commands:subplebbit:list");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const subs = plebbit.subplebbits;
        if (flags.quiet) {
            this.log(subs.join(os_1.EOL));
        }
        else {
            const subsWithStarted = await Promise.all(subs.map(async (subAddress) => {
                const subInstance = await plebbit.createSubplebbit({ address: subAddress });
                return { address: subInstance.address, started: subInstance.started };
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
exports.default = List;
