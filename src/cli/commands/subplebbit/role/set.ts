import { Flags } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { BaseCommand } from "../../../base-command.js";
import fetch from "node-fetch";
import { SubplebbitRole, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { statusCodes, statusMessages } from "../../../../api/response-statuses.js";
import { exitStatuses } from "../../../exit-codes.js";

export default class Set extends BaseCommand {
    static override description =
        "Set role to an author within the subplebbit. If an author has a role already, it would get overidden with the new role";

    static override examples = ["plebbit subplebbit role set plebbit.eth estebanabaroa.eth --role admin"];

    static override flags = {
        role: Flags.enum<SubplebbitRole["role"]>({
            options: ["admin", "moderator", "owner"],
            description: "New role for the author",
            default: "moderator",
            required: true
        })
    };

    static override args = [
        {
            name: "sub-address",
            required: true, // make the arg required with `required: true`
            description: "Address of subplebbit"
        },
        {
            name: "author-address",
            required: true,
            description: "The address of the author to set the role to"
        }
    ];

    async run(): Promise<void> {
        const { flags, args } = await this.parse(Set);

        const log = Logger("plebbit-cli:commands:subplebbit:roles:set");
        log(`flags: `, flags);
        log(`args: `, args);
        const authorAddress: string = args["author-address"];
        const subplebbitAddress: string = args["sub-address"];
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());

        const subRes = await fetch(`${flags.apiUrl}/subplebbit/create`, {
            method: "POST",
            body: JSON.stringify({ address: subplebbitAddress })
        });
        if (subRes.status === statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
            this.error(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, {
                code: "ERR_SUBPLEBBIT_DOES_NOT_EXIST",
                exit: exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST
            });
        if (subRes.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED) this.error(subRes.statusText);
        const sub: SubplebbitType = await subRes.json();

        const newRoles: SubplebbitType["roles"] = { ...sub.roles, [authorAddress]: { role: flags.role } };

        const editRes = await fetch(`${flags.apiUrl}/subplebbit/edit?address=${sub.address}`, {
            body: JSON.stringify({ roles: newRoles }),
            method: "POST",
            headers: { "content-type": "application/json" }
        });

        if (editRes.status !== statusCodes.SUCCESS_SUBPLEBBIT_EDITED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(editRes.statusText);
    }
}
