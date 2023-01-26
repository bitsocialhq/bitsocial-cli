import Logger from "@plebbit/plebbit-logger";
import { BaseCommand } from "../../../base-command.js";
import fetch from "node-fetch";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { statusCodes, statusMessages } from "../../../../api/response-statuses.js";
import { exitMessages, exitStatuses } from "../../../exit-codes.js";

export default class Remove extends BaseCommand {
    static override description = "Remove role of an author within the subplebbit";

    static override examples = ["plebbit subplebbit role remove plebbit.eth estebanabaroa.eth"];

    static override flags = {};

    static override args = [
        {
            name: "sub-address",
            required: true,
            description: "Address of subplebbit"
        },
        {
            name: "author-address",
            required: true,
            description: "The address of the author to remove their role"
        }
    ];

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Remove);

        const log = Logger("plebbit-cli:commands:subplebbit:roles:remove");
        log(`args: `, args);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());

        const subRes = await fetch(`${flags.apiUrl}/subplebbit/create`, {
            method: "POST",
            body: JSON.stringify({ address: args["sub-address"] })
        });
        if (subRes.status === statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
            this.error(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, {
                code: "ERR_SUBPLEBBIT_DOES_NOT_EXIST",
                exit: exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST
            });
        if (subRes.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED) this.error(subRes.statusText);
        const sub: SubplebbitType = await subRes.json();

        if (sub.roles && sub.roles[args["author-address"]]?.role) delete sub.roles[args["author-address"]];
        else
            this.error(exitMessages.ERR_AUTHOR_ROLE_DOES_NOT_EXIST, {
                code: "ERR_AUTHOR_ROLE_DOES_NOT_EXIST",
                exit: exitStatuses.ERR_AUTHOR_ROLE_DOES_NOT_EXIST
            });

        const editRes = await fetch(`${flags.apiUrl}/subplebbit/edit?address=${sub.address}`, {
            body: JSON.stringify({ roles: sub.roles }),
            method: "POST",
            headers: { "content-type": "application/json" }
        });

        if (editRes.status !== statusCodes.SUCCESS_SUBPLEBBIT_EDITED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(editRes.statusText);
    }
}
