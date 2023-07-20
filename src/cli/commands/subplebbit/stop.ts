import Logger from "@plebbit/plebbit-logger";
import { statusCodes, statusMessages } from "../../../api/response-statuses.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";
import { Args } from "@oclif/core";
import { exitStatuses } from "../../exit-codes.js";

export default class Stop extends BaseCommand {
    static override description =
        "Stop a subplebbit. The subplebbit will not publish or receive any publications until it is started again.";

    static override strict = false; // To allow for variable length arguments

    static override args = {
        addresses: Args.string({
            name: "addresses",
            required: true,
            description: "Addresses of subplebbits to stop. Separated by space"
        })
    };

    static override examples = [
        "plebbit subplebbit stop plebbit.eth",
        "plebbit subplebbit stop Qmb99crTbSUfKXamXwZBe829Vf6w5w5TktPkb6WstC9RFW"
    ];

    async run() {
        const { argv, flags } = await this.parse(Stop);

        const log = Logger("plebbit-cli:commands:subplebbit:stop");
        log(`addresses: `, argv);
        log(`flags: `, flags);
        const addresses = <string[]>argv;
        if (!Array.isArray(addresses)) throw Error(`Failed to parse addresses correctly (${addresses})`);

        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        for (const address of addresses) {
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
