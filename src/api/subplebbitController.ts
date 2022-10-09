import { RUNNING_SUBPLEBBITS } from "@plebbit/plebbit-js/dist/node/subplebbit.js";
import { CreateSubplebbitOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import { messages as plebbitErrorMessages } from "@plebbit/plebbit-js/dist/node/errors.js";
import { Controller, Post, Route, Body, Query, SuccessResponse, Response, Request } from "tsoa";
import { Request as ExRequest } from "express";

import { SubplebbitList } from "../types.js";
import { sharedSingleton } from "./server.js";
import { statusCodes, statusMessages } from "./ResponseStatuses.js";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";

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
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, statusMessages.SUCCESS_SUBPLEBBIT_CREATED)
    @Response(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY)
    @Post("create")
    public async create(@Body() requestBody: CreateSubplebbitOptions, @Request() request: ExRequest): Promise<SubplebbitType> {
        const sub = await sharedSingleton.plebbit.createSubplebbit(requestBody);
        sharedSingleton.subs[sub.address] = sub;

        request.statusMessage = statusMessages.SUCCESS_SUBPLEBBIT_CREATED;

        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_CREATED, statusCodes.SUCCESS_SUBPLEBBIT_CREATED, sub.toJSON());
    }

    /**
     * Start a subplebbit that has been created before. Subplebbit will be receiving new challenges through pubsub and publish a new IPNS record to be consumed by end users
     * Note: If this is the first time you're starting the subplebbit, expect It will take minutes to respond.
     * @param address The address of the subplebbit to be started
     *
     */
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_STARTED, statusMessages.SUCCESS_SUBPLEBBIT_STARTED)
    @Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    @Response(statusCodes.ERR_SUB_ALREADY_STARTED, statusMessages.ERR_SUB_ALREADY_STARTED)
    @Post("start")
    public async start(@Query("address") address: string): Promise<void> {
        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        try {
            //@ts-ignore
            await sharedSingleton.subs[address].start();
        } catch (e) {
            if (e instanceof Error && e.message === plebbitErrorMessages.ERR_SUB_ALREADY_STARTED)
                throw new ApiError(e.message, statusCodes.ERR_SUB_ALREADY_STARTED);
            else throw e;
        }
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_STARTED, statusCodes.SUCCESS_SUBPLEBBIT_STARTED, undefined);
    }

    /**
     * Stop a running subplebbit
     *
     * @param address The address of the subplebbit to be started
     *
     */
    @SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, statusMessages.SUCCESS_SUBPLEBBIT_STOPPED)
    @Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST)
    @Post("stop")
    public async stop(@Query("address") address: string): Promise<void> {
        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        await sharedSingleton.subs[address]?.stop();
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_STOPPED, statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, undefined);
    }
}
