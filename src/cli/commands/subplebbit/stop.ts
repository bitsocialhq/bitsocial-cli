import { getPlebbitLogger } from "../../../util.js";
import { BaseCommand } from "../../base-command.js";
import { Args } from "@oclif/core";

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

        const log = (await getPlebbitLogger())("plebbit-cli:commands:subplebbit:stop");
        log(`addresses: `, argv);
        log(`flags: `, flags);
        const addresses = <string[]>argv;
        if (!Array.isArray(addresses)) this.error(`Failed to parse addresses correctly (${addresses})`);

        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        for (const address of addresses) {
            await plebbit.plebbitRpcClient!.stopSubplebbit(address);
            this.log(address);
        }
        await plebbit.destroy();
    }
}
