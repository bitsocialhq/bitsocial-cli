import { Flags } from "@oclif/core";
import { SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes } from "../../../api/response-statuses.js";
import fetch from "node-fetch";
import { CreateSubplebbitOptions } from "../../types.js";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";

export default class Create extends BaseSubplebbitOptions {
    static override description = "Create a subplebbit";

    static override examples = [
        {
            description: "Create a subplebbit with title 'Hello Plebs' and description 'Welcome'",
            command: "<%= config.bin %> <%= command.id %> --title 'Hello Plebs' --description 'Welcome'"
        }
    ];

    // TODO implement roles, flairs flag
    static override flags = {
        ...BaseSubplebbitOptions.baseSubplebbitFlags,
        "signer.privateKey": Flags.string({
            description:
                "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). If it's not provided then Plebbit will generate a private key"
        })
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Create);

        const log = Logger("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions: CreateSubplebbitOptions = DataObjectParser.transpose(lodash.omit(flags, ["apiUrl"]))["_data"];

        const res = await fetch(`${flags.apiUrl}/subplebbit/create`, {
            body: JSON.stringify(createOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(res.statusText);

        this.log(JSON.stringify(this.toSuccessJson(<SubplebbitType>await res.json())));
    }
}
