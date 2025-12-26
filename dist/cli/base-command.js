import { Command, Flags } from "@oclif/core";
import defaults from "../common-utils/defaults.js";
import Plebbit from "@plebbit/plebbit-js";
export class BaseCommand extends Command {
    static baseFlags = {
        plebbitRpcUrl: Flags.url({
            summary: "URL to Plebbit RPC",
            required: true,
            default: defaults.PLEBBIT_RPC_URL
        })
    };
    async _connectToPlebbitRpc(plebbitRpcUrl) {
        const plebbit = await Plebbit({ plebbitRpcClientsOptions: [plebbitRpcUrl] });
        plebbit.on("error", (err) => console.error("Error from plebbit instance", err));
        await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
        return plebbit;
    }
}
