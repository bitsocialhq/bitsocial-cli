import { Flags } from "@oclif/core";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes } from "../../../api/responseStatuses.js";
import fetch from "node-fetch";
import { CreateSubplebbitOptions } from "../../types.js";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";

export default class Create extends BaseSubplebbitOptions {
    static override description = "Create a subplebbit";

    static override examples = [];

    // TODO implement roles, flairs flag
    static override flags = {
        ...BaseSubplebbitOptions.baseSubplebbitFlags,
        "signer.privateKey": Flags.string({
            summary:
                "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). Only needed if you're creating a new subplebbit"
        }),
        "database.connection.filename": Flags.file({ exists: false, summary: "Path to the subplebbit sqlite file" })
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Create);

        const log = Logger("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions: CreateSubplebbitOptions = DataObjectParser.transpose(lodash.omit(flags, ["apiUrl"]))["_data"];

        const res = await fetch.default(`${flags.apiUrl}/subplebbit/create`, {
            body: JSON.stringify(createOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED) {
            // TODO, status text is not enough to explain error. Include more info
            this.logToStderr(res.statusText);
            this.exit(1);
        }

        this.log(this.toSuccessJson(<SubplebbitType>await res.json()));
    }
}
