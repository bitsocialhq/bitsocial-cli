import { Command, Flags } from "@oclif/core";
import defaults from "../common-utils/defaults.js";
export abstract class BaseCommand extends Command {
    static override baseFlags = {
        plebbitRpcUrl: Flags.url({
            summary: "URL to Plebbit RPC",
            required: true,
            default: defaults.PLEBBIT_RPC_URL
        })
    };

    protected async _connectToPlebbitRpc(plebbitRpcUrl: string) {
        const Plebbit = await import("@plebbit/plebbit-js");
        const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcUrl] });
        await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
        return plebbit;
    }
}
