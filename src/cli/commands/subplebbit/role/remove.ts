import Logger from "@plebbit/plebbit-logger";
import { BaseCommand } from "../../../base-command.js";
import assert from "assert";
import { Args } from "@oclif/core";
import lodash from "lodash";

export default class Remove extends BaseCommand {
    static override description = "Remove role of an author within the subplebbit";

    static override examples = ["plebbit subplebbit role remove plebbit.eth estebanabaroa.eth"];

    static override flags = {};

    static override args = {
        "sub-address": Args.string({
            name: "sub-address",
            required: true,
            description: "Address of subplebbit"
        }),
        "author-address": Args.string({
            name: "author-address",
            required: true,
            description: "The address of the author to remove their role"
        })
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Remove);

        const log = Logger("plebbit-cli:commands:subplebbit:roles:remove");
        log(`args: `, args);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const sub = await plebbit.createSubplebbit({ address: args["sub-address"] });
        assert.equal(sub.address, args["sub-address"]);
        if (!sub?.roles?.[args["author-address"]]) this.error(`There is no role with author address (${args["author-address"]})`);
        const newRoles = lodash.omit(sub.roles, args["author-address"]);
        await sub.edit({ roles: newRoles });
        await plebbit.destroy();
    }
}
