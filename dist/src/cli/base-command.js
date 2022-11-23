import { Command, Flags } from "@oclif/core";
import { URL } from "url";
import fetch from "node-fetch";
import defaults from "../common-utils/defaults.js";
import { exitCodes, exitMessages, exitStatuses } from "./exit-codes.js";
export class BaseCommand extends Command {
    constructor() {
        super(...arguments);
        this._isDaemonUp = async (apiUrl) => {
            try {
                const url = `${apiUrl}/subplebbit/list`;
                await (await fetch.default(url, { method: "POST" })).json();
                return true;
            }
            catch (e) {
                return false;
            }
        };
        this.stopIfDaemonIsDown = async (apiUrl) => {
            if (!(await this._isDaemonUp(apiUrl)))
                this.error(exitMessages.ERR_DAEMON_IS_DOWN, {
                    code: exitCodes.ERR_DAEMON_IS_DOWN,
                    exit: exitStatuses.ERR_DAEMON_IS_DOWN
                });
        };
    }
}
BaseCommand.globalFlags = {
    apiUrl: Flags.url({
        summary: "URL to Plebbit API",
        required: true,
        default: new URL(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`)
    })
};
