"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../../base-command.js");
const assert_1 = tslib_1.__importDefault(require("assert"));
const core_1 = require("@oclif/core");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
class Remove extends base_command_js_1.BaseCommand {
    async run() {
        const { args, flags } = await this.parse(Remove);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:roles:remove");
        log(`args: `, args);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const sub = await plebbit.createSubplebbit({ address: args["sub-address"] });
        assert_1.default.equal(sub.address, args["sub-address"]);
        if (!sub?.roles?.[args["author-address"]])
            this.error(`There is no role with author address (${args["author-address"]})`);
        const newRoles = lodash_1.default.omit(sub.roles, args["author-address"]);
        await sub.edit({ roles: newRoles });
        await plebbit.destroy();
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
