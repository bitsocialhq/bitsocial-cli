import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes } from "../../../api/response-statuses.js";
import fetch from "node-fetch";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";
export default class Edit extends BaseSubplebbitOptions {
    async run() {
        const { flags } = await this.parse(Edit);
        const log = Logger("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const editOptions = DataObjectParser.transpose(lodash.omit(flags, ["apiUrl"]))["_data"];
        const res = await fetch.default(`${flags.apiUrl}/subplebbit/edit`, {
            body: JSON.stringify(editOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_EDITED) {
            // TODO, status text is not enough to explain error. Include more info
            this.logToStderr(res.statusText);
            this.exit(1);
        }
        this.log(this.toSuccessJson(await res.json()));
    }
}
Edit.description = "Edit a subplebbit";
Edit.examples = [];
// TODO implement roles, flairs flag
Edit.flags = { ...BaseSubplebbitOptions.baseSubplebbitFlags };
