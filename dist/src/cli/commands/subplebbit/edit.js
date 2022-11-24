"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const response_statuses_js_1 = require("../../../api/response-statuses.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
//@ts-ignore
const dataobject_parser_1 = tslib_1.__importDefault(require("dataobject-parser"));
const base_subplebbit_options_js_1 = tslib_1.__importDefault(require("../../base-subplebbit-options.js"));
const exit_codes_js_1 = require("../../exit-codes.js");
class Edit extends base_subplebbit_options_js_1.default {
    async run() {
        const { flags, args } = await this.parse(Edit);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const editOptions = dataobject_parser_1.default.transpose(lodash_1.default.omit(flags, ["apiUrl"]))["_data"];
        const res = await (0, node_fetch_1.default)(`${flags.apiUrl}/subplebbit/edit?address=${args["address"]}`, {
            body: JSON.stringify(editOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (res.status === response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
            this.error(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, {
                code: response_statuses_js_1.statusMessageKeys.ERR_SUBPLEBBIT_DOES_NOT_EXIST,
                exit: exit_codes_js_1.exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST
            });
        if (res.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_EDITED) {
            // TODO, status text is not enough to explain error. Include more info
            this.logToStderr(res.statusText);
            this.exit(1);
        }
        this.log(JSON.stringify(this.toSuccessJson(await res.json())));
    }
}
exports.default = Edit;
Edit.description = "Edit a subplebbit";
Edit.args = [
    {
        name: "address",
        required: true,
        description: "Address of the subplebbit address to edit"
    }
];
Edit.examples = [];
// TODO implement roles, flairs flag
Edit.flags = { ...base_subplebbit_options_js_1.default.baseSubplebbitFlags };
