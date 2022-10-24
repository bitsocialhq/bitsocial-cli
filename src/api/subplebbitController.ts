import { RUNNING_SUBPLEBBITS } from "@plebbit/plebbit-js/dist/node/subplebbit.js";
import { CreateSubplebbitOptions, SubplebbitEditOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { messages as plebbitErrorMessages } from "@plebbit/plebbit-js/dist/node/errors.js";
import { Controller, Post, Route, Body, Query, SuccessResponse, Response } from "tsoa";

import { SubplebbitList } from "../types.js";
import { sharedSingleton } from "./server.js";
import { statusCodes, statusMessages } from "./responseStatuses.js";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";
import Logger from "@plebbit/plebbit-logger";

@Route("/api/v0/subplebbit")
export class SubplebbitController extends Controller {
    @Post("list")
    public async list(): Promise<SubplebbitList> {
        const log = Logger("plebbit-cli:api:subplebbit:list");
        log(`Received request to list subplebbits`);

        const subsFromPlebbit = await sharedSingleton.plebbit.listSubplebbits();
        return subsFromPlebbit.map((address) => ({ started: Boolean(RUNNING_SUBPLEBBITS[address]), address }));
    }

    /**
     * @example requestBody { "title": "Memes", "description": "Post your memes here." }
     * @param requestBody The initial fields of the subplebbit. Could also be {address} to retrieve a subplebbit that has been created in the past
     * @returns Subplebbit after being created. Will omit signer and senstive fields
     */
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, statusMessages.SUCCESS_SUBPLEBBIT_CREATED)
    @Response(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY)
    @Post("create")
    public async create(@Body() requestBody: CreateSubplebbitOptions): Promise<SubplebbitType> {
        const log = Logger("plebbit-cli:api:subplebbit:create");
        log(`Received request to create with body, `, requestBody);
        const sub = await sharedSingleton.plebbit.createSubplebbit(requestBody);
        sharedSingleton.subs[sub.address] = sub;

        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_CREATED, statusCodes.SUCCESS_SUBPLEBBIT_CREATED, sub.toJSON());
    }

    /**
     * Start a subplebbit that has been created before. Subplebbit will be receiving new challenges through pubsub and publish a new IPNS record to be consumed by end users
     *
     *  Note: If this the first time you're starting the subplebbit, you should expect a a response within 2 minutes.
     * @param address The address of the subplebbit to be started
     *
     */
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_STARTED, statusMessages.SUCCESS_SUBPLEBBIT_STARTED)
    @Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    @Response(statusCodes.ERR_SUB_ALREADY_STARTED, statusMessages.ERR_SUB_ALREADY_STARTED)
    @Post("start")
    public async start(@Query("address") address: string): Promise<void> {
        const log = Logger("plebbit-cli:api:subplebbit:start");
        log(`Received request to start subplebbit ${address}`);
        if (!(address in sharedSingleton.subs) && (await sharedSingleton.plebbit.listSubplebbits()).includes(address))
            sharedSingleton.subs[address] = await sharedSingleton.plebbit.createSubplebbit({ address });
        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);

        //@ts-ignore
        if (process.env["SYNC_INTERVAL_MS"]) sharedSingleton.subs[address]._syncIntervalMs = parseInt(process.env["SYNC_INTERVAL_MS"]);
        try {
            //@ts-ignore
            await sharedSingleton.subs[address].start();
        } catch (e) {
            if (e instanceof Error && e.message === plebbitErrorMessages.ERR_SUB_ALREADY_STARTED)
                throw new ApiError(statusMessages.ERR_SUB_ALREADY_STARTED, statusCodes.ERR_SUB_ALREADY_STARTED);
            else throw e;
        }
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_STARTED, statusCodes.SUCCESS_SUBPLEBBIT_STARTED, undefined);
    }

    /**
     * Stop a running subplebbit
     *
     * @param address The address of the subplebbit to be stopped
     *
     */
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, statusMessages.SUCCESS_SUBPLEBBIT_STOPPED)
    @Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    @Response(statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING, statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING)
    @Post("stop")
    public async stop(@Query("address") address: string): Promise<void> {
        const log = Logger("plebbit-cli:api:subplebbit:stop");
        log(`Received request to stop subplebbit ${address}`);

        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        if (sharedSingleton.subs[address]?.dbHandler === undefined)
            // If db handler is undefined that means the subplebbit is not running
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING, statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING);
        await sharedSingleton.subs[address]?.stop();
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_STOPPED, statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, undefined);
    }

    /**
     * Edit subplebbit fields
     *
     * @param requestBody The fields to change within subplebbit
     * @param address The address of the subplebbit to be edited
     *
     */
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_EDITED, statusMessages.SUCCESS_SUBPLEBBIT_EDITED)
    @Response(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY)
    @Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    @Post("edit")
    public async edit(@Query("address") address: string, @Body() requestBody: SubplebbitEditOptions): Promise<void> {
        const log = Logger("plebbit-cli:api:subplebbit:edit");
        log(`Received request to edit subplebbit ${address} with request body, `, requestBody);

        if (!(address in sharedSingleton.subs) && (await sharedSingleton.plebbit.listSubplebbits()).includes(address))
            sharedSingleton.subs[address] = await sharedSingleton.plebbit.createSubplebbit({ address });
        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        await sharedSingleton.subs[address]?.edit(requestBody);
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_EDITED, statusCodes.SUCCESS_SUBPLEBBIT_EDITED, undefined);
    }
}
