import { Flags, CliUx } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";
import { EOL } from "os";
export default class List extends BaseCommand {
    async run() {
        const { flags } = await this.parse(List);
        const log = Logger("plebbit-cli:commands:subplebbit:list");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const url = `${flags.apiUrl}/subplebbit/list`;
        const subs = await (await fetch.default(url, {
            method: "POST"
        })).json();
        if (flags.quiet)
            this.log(subs.map((sub) => sub.address).join(EOL));
        else {
            CliUx.ux.table(subs, { address: {}, started: {} }, {
                printLine: this.log.bind(this),
                ...flags,
                sort: "-started"
            });
        }
    }
}
List.description = "List your subplebbits";
List.examples = [];
List.flags = {
    quiet: Flags.boolean({ char: "q", summary: "Only display subplebbit addresses" }),
    ...CliUx.ux.table.flags()
};
