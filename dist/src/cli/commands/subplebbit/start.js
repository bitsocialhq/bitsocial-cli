"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const response_statuses_js_1 = require("../../../api/response-statuses.js");
const base_command_js_1 = require("../../base-command.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const exit_codes_js_1 = require("../../exit-codes.js");
const core_1 = require("@oclif/core");
class Start extends base_command_js_1.BaseCommand {
    async run() {
        const { argv, flags } = await this.parse(Start);
        const addresses = argv;
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:start");
        log(`addresses: `, addresses);
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of addresses) {
            const url = `${flags.apiUrl}/subplebbit/start?address=${address}`;
            const res = await (0, node_fetch_1.default)(url, { method: "POST" });
            if (res.status === response_statuses_js_1.statusCodes.ERR_SUB_ALREADY_STARTED)
                this.error(response_statuses_js_1.statusMessages.ERR_SUB_ALREADY_STARTED, {
                    code: "ERR_SUB_ALREADY_STARTED",
                    exit: exit_codes_js_1.exitStatuses.ERR_SUB_ALREADY_STARTED
                });
            if (res.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STARTED)
                this.error(res.statusText);
            else
                this.log(address);
        }
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
