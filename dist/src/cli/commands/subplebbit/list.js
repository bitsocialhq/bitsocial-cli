"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../base-command.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const os_1 = require("os");
class List extends base_command_js_1.BaseCommand {
    async run() {
        const { flags } = await this.parse(List);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:list");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const url = `${flags.apiUrl}/subplebbit/list`;
        const subs = await (await (0, node_fetch_1.default)(url, {
            method: "POST"
        })).json();
        if (flags.quiet)
            this.log(subs.map((sub) => sub.address).join(os_1.EOL));
        else
            core_1.CliUx.ux.table(subs, { address: {}, started: {} }, {
                printLine: this.log.bind(this),
                ...flags,
                sort: "-started"
            });
    }
}
exports.default = List;
List.description = "List your subplebbits";
List.examples = [];
List.flags = {
    quiet: core_1.Flags.boolean({ char: "q", summary: "Only display subplebbit addresses" }),
    ...core_1.CliUx.ux.table.flags()
};
