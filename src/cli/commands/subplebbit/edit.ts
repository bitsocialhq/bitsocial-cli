import { SubplebbitEditOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes, statusMessages } from "../../../api/response-statuses.js";
import fetch from "node-fetch";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";
import { exitStatuses } from "../../exit-codes.js";

export default class Edit extends BaseSubplebbitOptions {
    static override description = "Edit a subplebbit";

    static override args = [
        {
            name: "address",
            required: true,
            description: "Address of the subplebbit address to edit"
        }
    ];

    static override examples = [];

    // TODO implement roles, flairs flag
    static override flags = { ...BaseSubplebbitOptions.baseSubplebbitFlags };

    async run(): Promise<void> {
        const { flags, args } = await this.parse(Edit);

        const log = Logger("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const editOptions: SubplebbitEditOptions = DataObjectParser.transpose(lodash.omit(flags, ["apiUrl"]))["_data"];

        const res = await fetch(`${flags.apiUrl}/subplebbit/edit?address=${args["address"]}`, {
            body: JSON.stringify(editOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });

        if (res.status === statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
            this.error(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, {
                code: "ERR_SUBPLEBBIT_DOES_NOT_EXIST",
                exit: exitStatuses.ERR_SUBPLEBBIT_DOES_NOT_EXIST
            });

        if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_EDITED) {
            // TODO, status text is not enough to explain error. Include more info
            this.logToStderr(res.statusText);
            this.exit(1);
        }

        this.log(JSON.stringify(this.toSuccessJson(<SubplebbitType>await res.json())));
    }
}
