"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const url_1 = require("url");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const defaults_js_1 = tslib_1.__importDefault(require("../common-utils/defaults.js"));
const exit_codes_js_1 = require("./exit-codes.js");
class BaseCommand extends core_1.Command {
    constructor() {
        super(...arguments);
        this._isDaemonUp = async (apiUrl) => {
            try {
                const url = `${apiUrl}/subplebbit/list`;
                await (await (0, node_fetch_1.default)(url, { method: "POST" })).json();
                return true;
            }
            catch (e) {
                return false;
            }
        };
        this.stopIfDaemonIsDown = async (apiUrl) => {
            if (!(await this._isDaemonUp(apiUrl)))
                this.error(exit_codes_js_1.exitMessages.ERR_DAEMON_IS_DOWN, {
                    code: "ERR_DAEMON_IS_DOWN",
                    exit: exit_codes_js_1.exitStatuses.ERR_DAEMON_IS_DOWN
                });
        };
    }
}
exports.BaseCommand = BaseCommand;
BaseCommand.baseFlags = {
    apiUrl: core_1.Flags.url({
        summary: "URL to Plebbit API",
        required: true,
        default: new url_1.URL(`http://localhost:${defaults_js_1.default.PLEBBIT_API_PORT}/api/v0`)
    })
};
