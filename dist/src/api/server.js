"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApi = exports.sharedSingleton = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importStar(require("express"));
const routes_js_1 = require("../../build/routes.js");
const swagger_json_1 = tslib_1.__importDefault(require("../../build/swagger.json"));
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const plebbit_js_1 = tslib_1.__importDefault(require("@plebbit/plebbit-js"));
const tsoa_1 = require("tsoa");
const assert_1 = tslib_1.__importStar(require("assert"));
const response_statuses_js_1 = require("./response-statuses.js");
const apiError_js_1 = require("./apiError.js");
const apiResponse_js_1 = require("./apiResponse.js");
const seeder_js_1 = require("./seeder.js");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const path_1 = tslib_1.__importDefault(require("path"));
async function startApi(plebbitApiPort, ipfsApiEndpoint, ipfsPubsubApiEndpoint, plebbitDataPath, seedSubs) {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:server");
    exports.sharedSingleton = {
        plebbit: await (0, plebbit_js_1.default)({
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            pubsubHttpClientsOptions: [ipfsPubsubApiEndpoint],
            dataPath: plebbitDataPath
        }),
        subs: {}
    };
    const app = (0, express_1.default)(); // TODO use http2
    app.use((0, express_1.json)({ strict: true }));
    (0, routes_js_1.RegisterRoutes)(app);
    app.use(function errorHandler(err, req, res, next) {
        if (err instanceof tsoa_1.ValidateError) {
            log(`Caught Validation Error for ${req.path}:`, err.fields);
            return res.status(422).json({
                message: "Validation Failed",
                details: err?.fields
            });
        }
        if (err instanceof SyntaxError) {
            res.statusMessage = response_statuses_js_1.statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY;
            return res.status(response_statuses_js_1.statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY).json({
                message: "Request body is invalid as a JSON",
                details: `${err.message}\n${err["body"]}`
            });
        }
        if (err instanceof apiResponse_js_1.ApiResponse) {
            res.statusMessage = err.statusMessage;
            return res.status(err.statusCode).send(err.res);
        }
        if (err instanceof apiError_js_1.ApiError) {
            res.statusMessage = err.statusMessage;
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error || err instanceof assert_1.AssertionError) {
            log.error(err);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
        next();
    });
    const swaggerHtml = swagger_ui_express_1.default.generateHTML(swagger_json_1.default);
    app.use("/api/v0/docs", swagger_ui_express_1.default.serve, async (_req, res) => {
        return res.send(swaggerHtml);
    });
    app.use(function notFoundHandler(_req, res) {
        res.status(404).send({
            message: "Not Found"
        });
    });
    const handleExit = async (signal) => {
        log(`in handle exit (${signal})`);
        await Promise.all(Object.values(exports.sharedSingleton.subs).map((sub) => sub.stop())); // Stop all running subs
        process.exit();
    };
    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handleExit));
    app.listen(plebbitApiPort, () => {
        console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
        const gateway = Object.keys(exports.sharedSingleton.plebbit.clients.ipfsGateways)[0];
        (0, assert_1.default)(typeof gateway === "string");
        console.log(`IPFS Gateway listening on: ${gateway.replace("127.0.0.1", "localhost")}`);
        console.log(`Plebbit API listening on: http://localhost:${plebbitApiPort}/api/v0`);
        console.log(`You can find Plebbit API documentation at: http://localhost:${plebbitApiPort}/api/v0/docs`);
        console.log(`Plebbit data path: ${path_1.default.resolve(exports.sharedSingleton.plebbit.dataPath)}`);
        if (Array.isArray(seedSubs)) {
            const seedSubsLoop = () => {
                (0, seeder_js_1.seedSubplebbits)(seedSubs, exports.sharedSingleton.plebbit).then(() => setTimeout(seedSubsLoop, 600000)); // Seed subs every 10 minutes
            };
            console.log(`Seeding subplebbits:`, seedSubs);
            seedSubsLoop();
        }
    });
}
exports.startApi = startApi;
