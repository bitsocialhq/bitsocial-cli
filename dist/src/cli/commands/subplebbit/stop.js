"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const response_statuses_js_1 = require("../../../api/response-statuses.js");
const base_command_js_1 = require("../../base-command.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const exit_codes_js_1 = require("../../exit-codes.js");
class Stop extends base_command_js_1.BaseCommand {
    async run() {
        const { argv, flags } = await this.parse(Stop);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:stop");
        log(`addresses: `, argv);
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of argv) {
            const url = `${flags.apiUrl}/subplebbit/stop?address=${address}`;
            const res = await (0, node_fetch_1.default)(url, { method: "POST" });
            if (res.status === response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING)
                this.error(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING, {
                    code: "ERR_SUBPLEBBIT_NOT_RUNNING",
                    exit: exit_codes_js_1.exitStatuses.ERR_SUBPLEBBIT_NOT_RUNNING
                });
            if (res.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STOPPED)
                this.error(res.statusText);
            else
                this.log(address);
        }
    }
}
exports.default = Stop;
Stop.description = "Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.";
Stop.strict = false; // To allow for variable length arguments
Stop.args = [
    {
        name: "addresses",
        required: true,
        description: "Addresses of subplebbits to stop. Separated by space"
    }
];
Stop.examples = [
    "plebbit subplebbit stop plebbit.eth",
    "plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW"
];
