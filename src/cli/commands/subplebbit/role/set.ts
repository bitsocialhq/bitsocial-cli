import { Args, Flags } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { BaseCommand } from "../../../base-command.js";
import assert from "assert";
import { SubplebbitRole } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";

export default class Set extends BaseCommand {
    static override description =
        "Set role to an author within the subplebbit. If an author has a role already, it would get overidden with the new role";

    static override examples = ["plebbit subplebbit role set plebbit.eth estebanabaroa.eth --role admin"];

    static override flags = {
        role: Flags.string({
            options: ["admin", "moderator", "owner"],
            description: "New role for the author",
            default: "moderator",
            required: true
        })
    };

    static override args = {
        "sub-address": Args.string({
            name: "sub-address",
            required: true, // make the arg required with `required: true`
            description: "Address of subplebbit"
        }),
        "author-address": Args.string({
            name: "author-address",
            required: true,
            description: "The address of the author to set the role to"
        })
    };

    async run(): Promise<void> {
        const { flags, args } = await this.parse(Set);

        const log = Logger("plebbit-cli:commands:subplebbit:roles:set");
        log(`flags: `, flags);
        log(`args: `, args);
        const subplebbitAddress = args["sub-address"];
        const authorAddress = args["author-address"];
        const role = <SubplebbitRole["role"]>flags.role;

        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });
        assert.equal(sub.address, subplebbitAddress);

        const newRoles = { ...sub.roles, [authorAddress]: { role } };

        await sub.edit({ roles: newRoles });
        await plebbit.destroy();
    }
}
