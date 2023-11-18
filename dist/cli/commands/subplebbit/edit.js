"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
//@ts-ignore
const dataobject_parser_1 = tslib_1.__importDefault(require("dataobject-parser"));
const core_1 = require("@oclif/core");
const base_command_js_1 = require("../../base-command.js");
class Edit extends base_command_js_1.BaseCommand {
    async run() {
        const { flags, args } = await this.parse(Edit);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        const editOptions = dataobject_parser_1.default.transpose(lodash_1.default.omit(flags, ["plebbitRpcApiUrl"]))["_data"];
        log("Edit options parsed:", editOptions);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const sub = await plebbit.createSubplebbit({ address: args.address });
        const mergedSubState = lodash_1.default.pick(sub.toJSONInternal(), Object.keys(editOptions));
        lodash_1.default.merge(mergedSubState, editOptions);
        log("Internal sub state after merge:", mergedSubState);
        await sub.edit(mergedSubState);
        this.log(sub.address);
        await plebbit.destroy();
    }
}
Edit.description = "Edit a subplebbit properties. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions";
Edit.args = {
    address: core_1.Args.string({
        name: "address",
        required: true,
        description: "Address of the subplebbit address to edit"
    })
};
Edit.examples = [
    {
        description: "Change the address of the sub to a new ENS address",
        command: "plebbit subplebbit edit 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu --address newAddress.eth"
    },
    {
        description: "Add the author address 'esteban.eth' as an admin on the sub",
        command: `plebbit subplebbit edit mysub.eth '--roles["esteban.eth"].role' admin`
    },
    {
        description: "Add two challenges to the sub. The first challenge will be a question and answer, and the second will be an image captcha",
        command: `plebbit subplebbit edit mysub.eth --settings.challenges[0].name question --settings.challenges[0].options.question "what is the password?" --settings.challenges[0].options.answer thepassword --settings.challenges[1].name captcha-canvas-v3`
    },
    {
        description: "Change the title and description",
        command: `plebbit subplebbit edit mysub.eth --title "This is the new title" --description "This is the new description" `
    }
];
exports.default = Edit;
