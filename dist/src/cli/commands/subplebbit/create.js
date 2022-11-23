import { Flags } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes } from "../../../api/response-statuses.js";
import fetch from "node-fetch";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";
export default class Create extends BaseSubplebbitOptions {
    async run() {
        const { flags } = await this.parse(Create);
        const log = Logger("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions = DataObjectParser.transpose(lodash.omit(flags, ["apiUrl"]))["_data"];
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
        this.log(JSON.stringify(this.toSuccessJson(await res.json())));
    }
}
Create.description = "Create a subplebbit";
Create.examples = [];
// TODO implement roles, flairs flag
Create.flags = {
    ...BaseSubplebbitOptions.baseSubplebbitFlags,
    "signer.privateKey": Flags.string({
        summary: "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). Only needed if you're creating a new subplebbit"
    }),
    "database.connection.filename": Flags.file({ exists: false, summary: "Path to the subplebbit sqlite file" })
};
