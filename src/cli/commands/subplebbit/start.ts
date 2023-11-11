import Logger from "@plebbit/plebbit-logger";
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

    static override examples = [];

    async run() {
        const { argv, flags } = await this.parse(Start);

        const addresses = <string[]>argv;
        const log = Logger("plebbit-cli:commands:subplebbit:start");
        log(`addresses: `, addresses);
        log(`flags: `, flags);

        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        for (const address of addresses) {
            await plebbit.plebbitRpcClient!.startSubplebbit(address);
            this.log(address);
        }
    }
}
