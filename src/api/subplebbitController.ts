import { RUNNING_SUBPLEBBITS } from "@plebbit/plebbit-js/dist/node/subplebbit.js";
import { Controller, Post, Route } from "tsoa";
import { SubplebbitList } from "../types.js";
import { sharedSingleton } from "./server.js";

@Route("/api/v0/subplebbit")
export class SubplebbitController extends Controller {
    @Post("/list")
    public async list(): Promise<SubplebbitList> {
        return Promise.all(
            (await sharedSingleton.plebbit.listSubplebbits()).map((subAddress) => {
                return { address: subAddress, started: Boolean(RUNNING_SUBPLEBBITS[subAddress]) };
            })
        );
    }
}
