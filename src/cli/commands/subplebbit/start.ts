import { getPlebbitLogger } from "../../../util.js";
import { BaseCommand } from "../../base-command.js";
import { Args } from "@oclif/core";

export default class Start extends BaseCommand {
    static override description = "Start a subplebbit";

    static override strict = false; // To allow for variable length arguments

    static override args = {
        addresses: Args.string({
            name: "addresses", // name of arg to show in help and reference with args[name]
            required: true,
            description: "Addresses of subplebbits to start. Separated by space"
        })
    };

    static override examples = [
        "plebbit subplebbit start plebbit.eth",
        "plebbit subplebbit start 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu"
    ];

    async run() {
        const { argv, flags } = await this.parse(Start);

        const addresses = <string[]>argv;
        const log = (await getPlebbitLogger())("plebbit-cli:commands:subplebbit:start");
        log(`addresses: `, addresses);
        log(`flags: `, flags);

        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        for (const address of addresses) {
            try {
                const sub = await plebbit.createSubplebbit({ address });
                await sub.start();
                this.log(address);
            } catch (e) {
                //@ts-expect-error
                e.details = { ...e.details, address };
                console.error(e);
                await plebbit.destroy();
                this.exit(1);
            }
        }
        await plebbit.destroy();
    }
}
