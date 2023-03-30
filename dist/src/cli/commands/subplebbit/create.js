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
const fs_1 = tslib_1.__importDefault(require("fs"));
class Create extends base_subplebbit_options_js_1.default {
    async run() {
        const { flags } = await this.parse(Create);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions = dataobject_parser_1.default.transpose(lodash_1.default.omit(flags, ["apiUrl", "privateKeyPath"]))["_data"];
        if (flags.privateKeyPath)
            createOptions.signer = { privateKey: (await fs_1.default.promises.readFile(flags.privateKeyPath)).toString(), type: "ed25519" };
        const createRes = await (0, node_fetch_1.default)(`${flags.apiUrl}/subplebbit/create`, {
            body: JSON.stringify(createOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (createRes.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_CREATED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(createRes.statusText);
        const createdSub = await createRes.json();
        // Attempt to start the newly created sub
        const startRes = await (0, node_fetch_1.default)(`${flags.apiUrl}/subplebbit/start?address=${createdSub.address}`, { method: "POST" });
        if (startRes.status !== response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STARTED)
            this.error(startRes.statusText);
        this.log(createdSub.address);
    }
}
exports.default = Create;
Create.description = "Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications";
Create.examples = [
    {
        description: "Create a subplebbit with title 'Hello Plebs' and description 'Welcome'",
        command: "<%= config.bin %> <%= command.id %> --title 'Hello Plebs' --description 'Welcome'"
    }
];
// TODO implement roles, flairs flag
Create.flags = {
    ...base_subplebbit_options_js_1.default.baseSubplebbitFlags,
    privateKeyPath: core_1.Flags.file({
        exists: true,
        description: "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). If it's not provided then Plebbit will generate a private key"
    })
};
