import { Command, Flags } from "@oclif/core";
import { URL } from "url";
import fetch from "node-fetch";
import defaults from "../common-utils/defaults.js";
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
            await (await fetch.default(url, { method: "POST" })).json();
            return true;
        } catch (e) {
            return false;
        }
    };

    stopIfDaemonIsDown = async (apiUrl: string) => {
        if (!(await this._isDaemonUp(apiUrl))) {
            this.logToStderr("Daemon is down. Please run 'plebbit daemon' before executing this command");
            this.exit(1);
        }
    };
}
