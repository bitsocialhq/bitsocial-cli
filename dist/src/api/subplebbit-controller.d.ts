import { CreateSubplebbitOptions, SubplebbitEditOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { Controller } from "tsoa";
import { SubplebbitList } from "./types.js";
export declare class SubplebbitController extends Controller {
    list(): Promise<SubplebbitList>;
    /**
     * @example requestBody { "title": "Memes", "description": "Post your memes here." }
     * @param requestBody The initial fields of the subplebbit. Could also be {address} to retrieve a subplebbit that has been created in the past
     * @returns Subplebbit after being created. Will omit signer and senstive fields
     */
    create(requestBody: CreateSubplebbitOptions): Promise<SubplebbitType>;
    /**
     * Start a subplebbit that has been created before. Subplebbit will be receiving new challenges through pubsub and publish a new IPNS record to be consumed by end users
     *
     *  Note: If this the first time you're starting the subplebbit, you should expect a a response within 2 minutes.
     * @param address The address of the subplebbit to be started
     *
     */
    start(address: string): Promise<void>;
    /**
     * Stop a running subplebbit
     *
     * @param address The address of the subplebbit to be stopped
     *
     */
    stop(address: string): Promise<void>;
    /**
     * Edit subplebbit fields
     *
     * @param requestBody The fields to change within subplebbit
     * @param address The address of the subplebbit to be edited
     *
     */
    edit(address: string, requestBody: SubplebbitEditOptions): Promise<void>;
}
