"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../../base-command.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const response_statuses_js_1 = require("../../../../api/response-statuses.js");
const exit_codes_js_1 = require("../../../exit-codes.js");
const assert_1 = tslib_1.__importDefault(require("assert"));
const core_1 = require("@oclif/core");
class Remove extends base_command_js_1.BaseCommand {
    async run() {
        const { args, flags } = await this.parse(Remove);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:roles:remove");
        log(`args: `, args);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const subRes = await (0, node_fetch_1.default)(`${flags.apiUrl}/subplebbit/create`, {
            method: "POST",
            body: JSON.stringify({ address: args["sub-address"] }),
            headers: { "content-type": "application/json" }
        });
        if (subRes.status === response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
            this.error(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, {
                code: "ERR_SUBPLEBBIT_DOES_NOT_EXIST",
                exit: exit_codes_js_1.exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST
            });
        if (subRes.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_CREATED)
            this.error(subRes.statusText);
        const sub = await subRes.json();
        assert_1.default.equal(sub.address, args["sub-address"]);
        if (sub.roles && sub.roles[args["author-address"]]?.role)
            delete sub.roles[args["author-address"]];
        else
            this.error(exit_codes_js_1.exitMessages.ERR_AUTHOR_ROLE_DOES_NOT_EXIST, {
                code: "ERR_AUTHOR_ROLE_DOES_NOT_EXIST",
                exit: exit_codes_js_1.exitStatuses.ERR_AUTHOR_ROLE_DOES_NOT_EXIST
            });
        const editRes = await (0, node_fetch_1.default)(`${flags.apiUrl}/subplebbit/edit?address=${sub.address}`, {
            body: JSON.stringify({ roles: sub.roles }),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (editRes.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_EDITED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(editRes.statusText);
    }
}
Remove.description = "Remove role of an author within the subplebbit";
Remove.examples = ["plebbit subplebbit role remove plebbit.eth estebanabaroa.eth"];
Remove.flags = {};
Remove.args = {
    "sub-address": core_1.Args.string({
        name: "sub-address",
        required: true,
        description: "Address of subplebbit"
    }),
    "author-address": core_1.Args.string({
        name: "author-address",
        required: true,
        description: "The address of the author to remove their role"
    })
};
exports.default = Remove;
