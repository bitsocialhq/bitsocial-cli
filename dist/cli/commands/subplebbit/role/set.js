"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const base_command_js_1 = require("../../../base-command.js");
const assert_1 = tslib_1.__importDefault(require("assert"));
class Set extends base_command_js_1.BaseCommand {
    async run() {
        const { flags, args } = await this.parse(Set);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:commands:subplebbit:roles:set");
        log(`flags: `, flags);
        log(`args: `, args);
        const subplebbitAddress = args["sub-address"];
        const authorAddress = args["author-address"];
        const role = flags.role;
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        assert_1.default.equal(sub.address, subplebbitAddress);
        const newRoles = { ...sub.roles, [authorAddress]: { role } };
        await sub.edit({ roles: newRoles });
        await plebbit.destroy();
    }
}
Set.description = "Set role to an author within the subplebbit. If an author has a role already, it would get overidden with the new role";
Set.examples = ["plebbit subplebbit role set plebbit.eth estebanabaroa.eth --role admin"];
Set.flags = {
    role: core_1.Flags.string({
        options: ["admin", "moderator", "owner"],
        description: "New role for the author",
        default: "moderator",
        required: true
    })
};
Set.args = {
    "sub-address": core_1.Args.string({
        name: "sub-address",
        required: true,
        description: "Address of subplebbit"
    }),
    "author-address": core_1.Args.string({
        name: "author-address",
        required: true,
        description: "The address of the author to set the role to"
    })
};
exports.default = Set;
