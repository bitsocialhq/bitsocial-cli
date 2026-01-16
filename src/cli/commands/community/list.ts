import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";
import { EOL } from "os";
import { getPlebbitLogger } from "../../../util.js";
import { printTable } from "@oclif/table";

export default class List extends BaseCommand {
    static override description = "List your communities";

    static override examples = ["bitsocial community list -q", "bitsocial community list"];

    static override flags = {
        quiet: Flags.boolean({ char: "q", summary: "Only display community addresses" })
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(List);

        const log = (await getPlebbitLogger())("bitsocial-cli:commands:community:list");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        const subs = plebbit.subplebbits;
        if (flags.quiet) {
            this.log(subs.join(EOL));
        } else {
            const subsWithStarted = await Promise.all(
                subs.map(async (subAddress: string) => {
                    const subInstance = await plebbit.createSubplebbit({ address: subAddress });
                    return { address: subInstance.address, started: subInstance.started };
                })
            );
            printTable({ data: subsWithStarted, sort: { started: "desc" } });
        }
        await plebbit.destroy();
    }
}
