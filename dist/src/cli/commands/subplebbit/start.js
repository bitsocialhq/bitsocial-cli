import Logger from "@plebbit/plebbit-logger";
import { statusCodes, statusMessageKeys, statusMessages } from "../../../api/response-statuses.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";
import { exitStatuses } from "../../exit-codes.js";
export default class Start extends BaseCommand {
    async run() {
        const { argv, flags } = await this.parse(Start);
        const log = Logger("plebbit-cli:commands:subplebbit:start");
        log(`argv: `, argv);
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of argv) {
            const url = `${flags.apiUrl}/subplebbit/start?address=${address}`;
            const res = await fetch.default(url, { method: "POST" });
            if (res.status === statusCodes.ERR_SUB_ALREADY_STARTED)
                this.error(statusMessages.ERR_SUB_ALREADY_STARTED, {
                    code: statusMessageKeys.ERR_SUB_ALREADY_STARTED,
                    exit: exitStatuses.ERR_SUB_ALREADY_STARTED
                });
            if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_STARTED)
                this.error(res.statusText);
            else
                this.log(address);
        }
    }
}
Start.description = "Start a subplebbit";
Start.strict = false; // To allow for variable length arguments
// TODO implement auto completion for start command by providing a discrete set of subplebbit addresses to start
Start.args = [
    {
        name: "addresses",
        required: true,
        description: "Addresses of subplebbits to start. Separated by space"
    }
];
Start.examples = [];
