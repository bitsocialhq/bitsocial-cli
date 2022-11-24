import { Command, Flags } from "@oclif/core";
import { URL } from "url";
import fetch from "node-fetch";
import defaults from "../common-utils/defaults.js";
import { exitCodes, exitMessages, exitStatuses } from "./exit-codes.js";
export abstract class BaseCommand extends Command {
    static override globalFlags = {
        apiUrl: Flags.url({
            summary: "URL to Plebbit API",
            required: true,
            default: new URL(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`)
        })
    };

    private _isDaemonUp = async (apiUrl: string) => {
        try {
            const url = `${apiUrl}/subplebbit/list`;
            await (await fetch(url, { method: "POST" })).json();
            return true;
        } catch (e) {
            return false;
        }
    };

    stopIfDaemonIsDown = async (apiUrl: string) => {
        if (!(await this._isDaemonUp(apiUrl)))
            this.error(exitMessages.ERR_DAEMON_IS_DOWN, {
                code: exitCodes.ERR_DAEMON_IS_DOWN,
                exit: exitStatuses.ERR_DAEMON_IS_DOWN
            });
    };
}
