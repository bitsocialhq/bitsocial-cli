"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const response_statuses_js_1 = require("../../../api/response-statuses.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
//@ts-ignore
const dataobject_parser_1 = tslib_1.__importDefault(require("dataobject-parser"));
const base_subplebbit_options_js_1 = tslib_1.__importDefault(require("../../base-subplebbit-options.js"));
class Create extends base_subplebbit_options_js_1.default {
    async run() {
        const { flags } = await this.parse(Create);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions = dataobject_parser_1.default.transpose(lodash_1.default.omit(flags, ["apiUrl"]))["_data"];
        const res = await (0, node_fetch_1.default)(`${flags.apiUrl}/subplebbit/create`, {
            body: JSON.stringify(createOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (res.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_CREATED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(res.statusText);
        this.log(JSON.stringify(this.toSuccessJson(await res.json())));
    }
}
exports.default = Create;
Create.description = "Create a subplebbit";
Create.examples = [];
// TODO implement roles, flairs flag
Create.flags = {
    ...base_subplebbit_options_js_1.default.baseSubplebbitFlags,
    "signer.privateKey": core_1.Flags.string({
        summary: "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). Only needed if you're creating a new subplebbit"
    }),
    "database.connection.filename": core_1.Flags.file({ exists: false, summary: "Path to the subplebbit sqlite file" })
};
