"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
//@ts-ignore
const dataobject_parser_1 = tslib_1.__importDefault(require("dataobject-parser"));
const base_subplebbit_options_js_1 = tslib_1.__importDefault(require("../../base-subplebbit-options.js"));
const core_1 = require("@oclif/core");
class Edit extends base_subplebbit_options_js_1.default {
    async run() {
        const { flags, args } = await this.parse(Edit);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const editOptions = dataobject_parser_1.default.transpose(lodash_1.default.omit(flags, ["plebbitRpcApiUrl"]))["_data"];
        const sub = await plebbit.createSubplebbit({ address: args.address });
        await sub.edit(editOptions);
        this.log(sub.address);
        await plebbit.destroy();
    }
}
Edit.description = "Edit a subplebbit";
Edit.args = {
    address: core_1.Args.string({
        name: "address",
        required: true,
        description: "Address of the subplebbit address to edit"
    })
};
Edit.examples = [];
// TODO implement roles, flairs flag
Edit.flags = {
    ...base_subplebbit_options_js_1.default.baseSubplebbitFlags,
    address: core_1.Flags.string({ summary: "New address of the subplebbit" })
};
exports.default = Edit;
