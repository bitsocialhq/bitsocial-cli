import { Flags, CliUx } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { SubplebbitList } from "../../../api/types.js";
import { BaseCommand } from "../../base-command.js";
import fetch from "node-fetch";
import { EOL } from "os";

export default class List extends BaseCommand {
    static override description = "List your subplebbits";

    static override examples = [];

    static override flags = {
        quiet: Flags.boolean({ char: "q", summary: "Only display subplebbit addresses" }),
        ...CliUx.ux.table.flags()
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(List);

        const log = Logger("plebbit-cli:commands:subplebbit:list");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const url = `${flags.apiUrl}/subplebbit/list`;

        const subs: SubplebbitList = <SubplebbitList>await (
            await fetch(url, {
                method: "POST"
            })
        ).json();

        if (flags.quiet) this.log(subs.map((sub) => sub.address).join(EOL));
        else {
            CliUx.ux.table(
                subs,
                { address: {}, started: {} },
                {
                    printLine: this.log.bind(this),
                    ...flags,
                    sort: "-started"
                }
            );
        }
    }
}
