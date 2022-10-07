import { RUNNING_SUBPLEBBITS } from "@plebbit/plebbit-js/dist/node/subplebbit.js";
import { CreateSubplebbitOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { Controller, Post, Route, Body } from "tsoa";
import { SubplebbitList } from "../types.js";
import { sharedSingleton } from "./server.js";

@Route("/api/v0/subplebbit")
export class SubplebbitController extends Controller {
    @Post("list")
    public async list(): Promise<SubplebbitList> {
        return Promise.all(
            (await sharedSingleton.plebbit.listSubplebbits()).map((subAddress) => {
                return { address: subAddress, started: Boolean(RUNNING_SUBPLEBBITS[subAddress]) };
            })
        );
    }

    /**
     * @example requestBody { "title": "Memes", "description": "Post your memes here." }
     * @param requestBody The initial fields of the subplebbit. Could also be {address} to retrieve a subplebbit that has been created in the past
     * @returns Subplebbit after being created. Will omit signer and senstive fields
     */
    @Post("create")
    public async create(@Body() requestBody: CreateSubplebbitOptions): Promise<SubplebbitType> {
        return (await sharedSingleton.plebbit.createSubplebbit(requestBody)).toJSON();
    }
}
