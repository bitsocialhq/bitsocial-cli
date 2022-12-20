import Logger from "@plebbit/plebbit-logger";
import { statusCodes, statusMessages } from "../../../api/response-statuses.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";
import { exitStatuses } from "../../exit-codes.js";

export default class Stop extends BaseCommand {
    static override description =
        "Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.";

    static override strict = false; // To allow for variable length arguments

    static override args = [
        {
            name: "addresses", // name of arg to show in help and reference with args[name]
            required: true, // make the arg required with `required: true`
            description: "Addresses of subplebbits to stop. Separated by space"
        }
    ];

    static override examples = [
        "plebbit subplebbit stop plebbit.eth",
        "plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW"
    ];

    async run() {
        const { argv, flags } = await this.parse(Stop);

        const log = Logger("plebbit-cli:commands:subplebbit:stop");
        log(`addresses: `, argv);
        log(`flags: `, flags);

        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of argv) {
            const url = `${flags.apiUrl}/subplebbit/stop?address=${address}`;
            const res = await fetch(url, { method: "POST" });
            if (res.status === statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING)
                this.error(statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING, {
                    code: "ERR_SUBPLEBBIT_NOT_RUNNING",
                    exit: exitStatuses.ERR_SUBPLEBBIT_NOT_RUNNING
                });
            if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_STOPPED) this.error(res.statusText);
            else this.log(address);
        }
    }
}
