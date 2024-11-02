import { Command, Flags } from "@oclif/core";
import { URL } from "url";
import defaults from "../common-utils/defaults.js";
export abstract class BaseCommand extends Command {
    static override baseFlags = {
        plebbitRpcApiUrl: Flags.url({
            summary: "URL to Plebbit RPC API",
            required: true,
            default: new URL(`ws://localhost:${defaults.PLEBBIT_RPC_API_PORT}`)
        })
    };

    protected async _connectToPlebbitRpc(plebbitRpcApiUrl: string) {
        const Plebbit = await import("@plebbit/plebbit-js");
        const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcApiUrl] });
        await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
        return plebbit;
    }
}
