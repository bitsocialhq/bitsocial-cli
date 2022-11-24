"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApi = exports.sharedSingleton = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importStar(require("express"));
const routes_js_1 = require("../../build/routes.js");
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const plebbit_js_1 = tslib_1.__importDefault(require("@plebbit/plebbit-js"));
const tsoa_1 = require("tsoa");
const assert_1 = require("assert");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const response_statuses_js_1 = require("./response-statuses.js");
const apiError_js_1 = require("./apiError.js");
const apiResponse_js_1 = require("./apiResponse.js");
async function startApi(plebbitApiPort, ipfsApiEndpoint, ipfsPubsubApiEndpoint, plebbitDataPath) {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:server");
    exports.sharedSingleton = {
        plebbit: await (0, plebbit_js_1.default)({
            ipfsHttpClientOptions: ipfsApiEndpoint,
            pubsubHttpClientOptions: ipfsPubsubApiEndpoint,
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
    const swaggerHtml = swagger_ui_express_1.default.generateHTML(JSON.parse((await fs_extra_1.default.promises.readFile("build/swagger.json")).toString()));
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
    app.listen(plebbitApiPort, () => console.log(`Plebbit API listening at http://localhost:${plebbitApiPort}\nYou can find API documentation at: http://localhost:${plebbitApiPort}/api/v0/docs`));
}
exports.startApi = startApi;
