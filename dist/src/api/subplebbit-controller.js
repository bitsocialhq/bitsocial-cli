import { __decorate, __metadata, __param } from "tslib";
import { RUNNING_SUBPLEBBITS } from "@plebbit/plebbit-js/dist/node/subplebbit.js";
import { messages as plebbitErrorMessages } from "@plebbit/plebbit-js/dist/node/errors.js";
import { Controller, Post, Route, Body, Query, SuccessResponse, Response } from "tsoa";
import { sharedSingleton } from "./server.js";
import { statusCodes, statusMessages } from "./response-statuses.js";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";
import Logger from "@plebbit/plebbit-logger";
let SubplebbitController = class SubplebbitController extends Controller {
    async list() {
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
    async create(requestBody) {
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
    async start(address) {
        const log = Logger("plebbit-cli:api:subplebbit:start");
        log(`Received request to start subplebbit ${address}`);
        if (!(address in sharedSingleton.subs) && (await sharedSingleton.plebbit.listSubplebbits()).includes(address))
            sharedSingleton.subs[address] = await sharedSingleton.plebbit.createSubplebbit({ address });
        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        //@ts-ignore
        if (process.env["SYNC_INTERVAL_MS"])
            sharedSingleton.subs[address]._syncIntervalMs = parseInt(process.env["SYNC_INTERVAL_MS"]);
        try {
            await sharedSingleton.subs[address].start();
        }
        catch (e) {
            if (e instanceof Error && e.message === plebbitErrorMessages.ERR_SUB_ALREADY_STARTED)
                throw new ApiError(statusMessages.ERR_SUB_ALREADY_STARTED, statusCodes.ERR_SUB_ALREADY_STARTED);
            else
                throw e;
        }
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_STARTED, statusCodes.SUCCESS_SUBPLEBBIT_STARTED, undefined);
    }
    /**
     * Stop a running subplebbit
     *
     * @param address The address of the subplebbit to be stopped
     *
     */
    async stop(address) {
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
    async edit(address, requestBody) {
        const log = Logger("plebbit-cli:api:subplebbit:edit");
        log(`Received request to edit subplebbit ${address} with request body, `, requestBody);
        if (!(address in sharedSingleton.subs) && (await sharedSingleton.plebbit.listSubplebbits()).includes(address))
            sharedSingleton.subs[address] = await sharedSingleton.plebbit.createSubplebbit({ address });
        if (!(address in sharedSingleton.subs))
            throw new ApiError(statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        await sharedSingleton.subs[address]?.edit(requestBody);
        throw new ApiResponse(statusMessages.SUCCESS_SUBPLEBBIT_EDITED, statusCodes.SUCCESS_SUBPLEBBIT_EDITED, undefined);
    }
};
__decorate([
    Post("list"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubplebbitController.prototype, "list", null);
__decorate([
    SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_CREATED, statusMessages.SUCCESS_SUBPLEBBIT_CREATED),
    Response(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY),
    Post("create"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubplebbitController.prototype, "create", null);
__decorate([
    SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_STARTED, statusMessages.SUCCESS_SUBPLEBBIT_STARTED),
    Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST),
    Response(statusCodes.ERR_SUB_ALREADY_STARTED, statusMessages.ERR_SUB_ALREADY_STARTED),
    Post("start"),
    __param(0, Query("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubplebbitController.prototype, "start", null);
__decorate([
    SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, statusMessages.SUCCESS_SUBPLEBBIT_STOPPED),
    Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST),
    Response(statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING, statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING),
    Post("stop"),
    __param(0, Query("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubplebbitController.prototype, "stop", null);
__decorate([
    SuccessResponse(statusCodes.SUCCESS_SUBPLEBBIT_EDITED, statusMessages.SUCCESS_SUBPLEBBIT_EDITED),
    Response(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY),
    Response(statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST),
    Post("edit"),
    __param(0, Query("address")),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubplebbitController.prototype, "edit", null);
SubplebbitController = __decorate([
    Route("/api/v0/subplebbit")
], SubplebbitController);
export { SubplebbitController };
