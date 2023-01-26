"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubplebbitController = void 0;
const tslib_1 = require("tslib");
const errors_js_1 = require("@plebbit/plebbit-js/dist/node/errors.js");
const tsoa_1 = require("tsoa");
const server_js_1 = require("./server.js");
const response_statuses_js_1 = require("./response-statuses.js");
const apiError_js_1 = require("./apiError.js");
const apiResponse_js_1 = require("./apiResponse.js");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
let SubplebbitController = class SubplebbitController extends tsoa_1.Controller {
    async list() {
        const log = (0, plebbit_logger_1.default)("plebbit-cli:api:subplebbit:list");
        log(`Received request to list subplebbits`);
        const subsFromPlebbit = await server_js_1.sharedSingleton.plebbit.listSubplebbits();
        return subsFromPlebbit.map((address) => ({
            started: fs_1.default.existsSync(path_1.default.join(server_js_1.sharedSingleton.plebbit.dataPath, "subplebbits", `${address}.start.lock`)),
            address
        }));
    }
    /**
     * @example requestBody { "title": "Memes", "description": "Post your memes here." }
     * @param requestBody The initial fields of the subplebbit. Could also be {address} to retrieve a subplebbit that has been created in the past
     * @returns Subplebbit after being created. Will omit signer and senstive fields
     */
    async create(requestBody) {
        const log = (0, plebbit_logger_1.default)("plebbit-cli:api:subplebbit:create");
        log(`Received request to create with body, `, requestBody);
        const sub = await server_js_1.sharedSingleton.plebbit.createSubplebbit(requestBody);
        server_js_1.sharedSingleton.subs[sub.address] = sub;
        throw new apiResponse_js_1.ApiResponse(response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_CREATED, response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_CREATED, sub.toJSON());
    }
    /**
     * Start a subplebbit that has been created before. Subplebbit will be receiving new challenges through pubsub and publish a new IPNS record to be consumed by end users
     *
     *  Note: If this the first time you're starting the subplebbit, you should expect a a response within 2 minutes.
     * @param address The address of the subplebbit to be started
     *
     */
    async start(address) {
        const log = (0, plebbit_logger_1.default)("plebbit-cli:api:subplebbit:start");
        log(`Received request to start subplebbit ${address}`);
        if (!(address in server_js_1.sharedSingleton.subs) && (await server_js_1.sharedSingleton.plebbit.listSubplebbits()).includes(address))
            server_js_1.sharedSingleton.subs[address] = await server_js_1.sharedSingleton.plebbit.createSubplebbit({ address });
        if (!(address in server_js_1.sharedSingleton.subs))
            throw new apiError_js_1.ApiError(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        //@ts-ignore
        if (process.env["SYNC_INTERVAL_MS"])
            server_js_1.sharedSingleton.subs[address]._syncIntervalMs = parseInt(process.env["SYNC_INTERVAL_MS"]);
        try {
            await server_js_1.sharedSingleton.subs[address].start();
        }
        catch (e) {
            if (e instanceof Error && e.message === errors_js_1.messages.ERR_SUB_ALREADY_STARTED)
                throw new apiError_js_1.ApiError(response_statuses_js_1.statusMessages.ERR_SUB_ALREADY_STARTED, response_statuses_js_1.statusCodes.ERR_SUB_ALREADY_STARTED);
            else
                throw e;
        }
        throw new apiResponse_js_1.ApiResponse(response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_STARTED, response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STARTED, undefined);
    }
    /**
     * Stop a running subplebbit
     *
     * @param address The address of the subplebbit to be stopped
     *
     */
    async stop(address) {
        const log = (0, plebbit_logger_1.default)("plebbit-cli:api:subplebbit:stop");
        log(`Received request to stop subplebbit ${address}`);
        if (!(address in server_js_1.sharedSingleton.subs))
            throw new apiError_js_1.ApiError(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        if (server_js_1.sharedSingleton.subs[address]?.dbHandler === undefined)
            // If db handler is undefined that means the subplebbit is not running
            throw new apiError_js_1.ApiError(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING, response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING);
        await server_js_1.sharedSingleton.subs[address]?.stop();
        throw new apiResponse_js_1.ApiResponse(response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_STOPPED, response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, undefined);
    }
    /**
     * Edit subplebbit fields
     *
     * @param requestBody The fields to change within subplebbit
     * @param address The address of the subplebbit to be edited
     *
     */
    async edit(address, requestBody) {
        const log = (0, plebbit_logger_1.default)("plebbit-cli:api:subplebbit:edit");
        log(`Received request to edit subplebbit ${address} with request body, `, requestBody);
        if (!(address in server_js_1.sharedSingleton.subs) && (await server_js_1.sharedSingleton.plebbit.listSubplebbits()).includes(address))
            server_js_1.sharedSingleton.subs[address] = await server_js_1.sharedSingleton.plebbit.createSubplebbit({ address });
        if (!(address in server_js_1.sharedSingleton.subs))
            throw new apiError_js_1.ApiError(response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST, response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST);
        await server_js_1.sharedSingleton.subs[address]?.edit(requestBody);
        throw new apiResponse_js_1.ApiResponse(response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_EDITED, response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_EDITED, undefined);
    }
};
tslib_1.__decorate([
    (0, tsoa_1.Post)("list"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SubplebbitController.prototype, "list", null);
tslib_1.__decorate([
    (0, tsoa_1.SuccessResponse)(response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_CREATED, response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_CREATED),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, response_statuses_js_1.statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY),
    (0, tsoa_1.Post)("create"),
    tslib_1.__param(0, (0, tsoa_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SubplebbitController.prototype, "create", null);
tslib_1.__decorate([
    (0, tsoa_1.SuccessResponse)(response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STARTED, response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_STARTED),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_SUB_ALREADY_STARTED, response_statuses_js_1.statusMessages.ERR_SUB_ALREADY_STARTED),
    (0, tsoa_1.Post)("start"),
    tslib_1.__param(0, (0, tsoa_1.Query)("address")),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], SubplebbitController.prototype, "start", null);
tslib_1.__decorate([
    (0, tsoa_1.SuccessResponse)(response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_STOPPED, response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_STOPPED),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_NOT_RUNNING, response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_NOT_RUNNING),
    (0, tsoa_1.Post)("stop"),
    tslib_1.__param(0, (0, tsoa_1.Query)("address")),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], SubplebbitController.prototype, "stop", null);
tslib_1.__decorate([
    (0, tsoa_1.SuccessResponse)(response_statuses_js_1.statusCodes.SUCCESS_SUBPLEBBIT_EDITED, response_statuses_js_1.statusMessages.SUCCESS_SUBPLEBBIT_EDITED),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY, response_statuses_js_1.statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY),
    (0, tsoa_1.Response)(response_statuses_js_1.statusCodes.ERR_SUBPLEBBIT_DOES_NOT_EXIST, response_statuses_js_1.statusMessages.ERR_SUBPLEBBIT_DOES_NOT_EXIST),
    (0, tsoa_1.Post)("edit"),
    tslib_1.__param(0, (0, tsoa_1.Query)("address")),
    tslib_1.__param(1, (0, tsoa_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SubplebbitController.prototype, "edit", null);
SubplebbitController = tslib_1.__decorate([
    (0, tsoa_1.Route)("/api/v0/subplebbit")
], SubplebbitController);
exports.SubplebbitController = SubplebbitController;
