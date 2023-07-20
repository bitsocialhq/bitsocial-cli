import Logger from "@plebbit/plebbit-logger";
import { statusCodes, statusMessages } from "../../../api/response-statuses.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";
import { exitStatuses } from "../../exit-codes.js";
import { Args } from "@oclif/core";

export default class Start extends BaseCommand {
    static override description = "Start a subplebbit";

    static override strict = false; // To allow for variable length arguments

    static override args = {
        addresses: Args.string({
            name: "addresses", // name of arg to show in help and reference with args[name]
            required: true, // make the arg required with `required: true`
            description: "Addresses of subplebbits to start. Separated by space"
        })
    };

    static override examples = [];

    async run() {
        const { argv, flags } = await this.parse(Start);

        const addresses = <string[]>argv;
        const log = Logger("plebbit-cli:commands:subplebbit:start");
        log(`addresses: `, addresses);
        log(`flags: `, flags);

        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of addresses) {
            const url = `${flags.apiUrl}/subplebbit/start?address=${address}`;
            const res = await fetch(url, { method: "POST" });
            if (res.status === statusCodes.ERR_SUB_ALREADY_STARTED)
                this.error(statusMessages.ERR_SUB_ALREADY_STARTED, {
                    code: "ERR_SUB_ALREADY_STARTED",
                    exit: exitStatuses.ERR_SUB_ALREADY_STARTED
                });
            if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_STARTED) this.error(res.statusText);
            else this.log(address);
        }
    }
}
