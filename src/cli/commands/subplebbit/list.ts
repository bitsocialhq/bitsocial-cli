import { Flags, ux } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { BaseCommand } from "../../base-command.js";
import { EOL } from "os";

export default class List extends BaseCommand {
    static override description = "List your subplebbits";

    static override examples = [];

    static override flags = {
        quiet: Flags.boolean({ char: "q", summary: "Only display subplebbit addresses" }),
        ...ux.table.flags()
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(List);

        const log = Logger("plebbit-cli:commands:subplebbit:list");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const subs = await plebbit.listSubplebbits();
        const subsWithStarted = await Promise.all(
            subs.map(async (subAddress) => {
                const subInstance = await plebbit.createSubplebbit({ address: subAddress });
                return { address: subInstance.address, started: subInstance.startedState !== "stopped" };
            })
        );



        if (flags.quiet) this.log(subsWithStarted.map((sub) => sub.address).join(EOL));
        else
            ux.table(
                subsWithStarted,
                { address: {}, started: {} },
                {
                    printLine: this.log.bind(this),
                    ...flags,
                    sort: "-started"
                }
            );
    }
}
