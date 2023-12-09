import { Command, Flags } from "@oclif/core";
import { URL } from "url";
import defaults from "../common-utils/defaults.js";
import Plebbit from "@plebbit/plebbit-js";
export abstract class BaseCommand extends Command {
    static override baseFlags = {
        plebbitRpcApiUrl: Flags.url({
            summary: "URL to Plebbit RPC API",
            required: true,
            default: new URL(`ws://localhost:${defaults.PLEBBIT_RPC_API_PORT}`)
        })
    };

    _connectToPlebbitRpc = async (plebbitRpcApiUrl: string) => {
        const plebbit = await Plebbit({ plebbitRpcClientsOptions: [plebbitRpcApiUrl] });
        await plebbit.listSubplebbits(); // To make sure we're connected
        return plebbit;
    };
}
