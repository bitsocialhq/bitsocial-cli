import Logger from "@plebbit/plebbit-logger";
import { statusCodes } from "../../../api/responseStatuses.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";

export default class Start extends BaseCommand {
    static override description = "Start a subplebbit";

    static override strict = false; // To allow for variable length arguments

    // TODO implement auto completion for start command by providing a discrete set of subplebbit addresses to start
    static override args = [
        {
            name: "addresses", // name of arg to show in help and reference with args[name]
            required: true, // make the arg required with `required: true`
            description: "Addresses of subplebbits to start. Separated by space"
        }
    ];

    static override examples = [];

    async run() {
        const { argv, flags } = await this.parse(Start);

        const log = Logger("plebbit-cli:commands:subplebbit:start");
        log(`argv: `, argv);
        log(`flags: `, flags);

        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of argv) {
            const url = `${flags.apiUrl}/subplebbit/start?address=${address}`;
            const res = await fetch(url, { method: "POST" });
            if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_STARTED) this.error(res.statusText);
            else this.log(address);
        }
    }
}
