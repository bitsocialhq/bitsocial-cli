import express, { Response as ExResponse, Request as ExRequest, json, NextFunction } from "express";
import { RegisterRoutes } from "../../build/routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs-extra";
import Plebbit from "@plebbit/plebbit-js";
import { SharedSingleton } from "./types.js";
import { ValidateError } from "tsoa";
import { AssertionError } from "assert";
import Logger from "@plebbit/plebbit-logger";
import { statusCodes, statusMessages } from "./response-statuses.js";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";

export let sharedSingleton: SharedSingleton;

export async function startApi(plebbitApiPort: number, ipfsApiEndpoint: string, ipfsPubsubApiEndpoint: string, plebbitDataPath: string) {
    const log = Logger("plebbit-cli:server");
    sharedSingleton = {
        plebbit: await Plebbit({
            ipfsHttpClientOptions: ipfsApiEndpoint,
            pubsubHttpClientOptions: ipfsPubsubApiEndpoint,
            dataPath: plebbitDataPath
        }),
        subs: {}
    };
    const app = express(); // TODO use http2

    app.use(json({ strict: true }));

    RegisterRoutes(app);

    app.use(function errorHandler(err: unknown, req: ExRequest, res: ExResponse, next: NextFunction): ExResponse | void {
        if (err instanceof ValidateError) {
            log(`Caught Validation Error for ${req.path}:`, err.fields);
            return res.status(422).json({
                message: "Validation Failed",
                details: err?.fields
            });
        }

        if (err instanceof SyntaxError) {
            res.statusMessage = statusMessages.ERR_INVALID_JSON_FOR_REQUEST_BODY;
            return res.status(statusCodes.ERR_INVALID_JSON_FOR_REQUEST_BODY).json({
                message: "Request body is invalid as a JSON", //@ts-ignore
                details: `${err.message}\n${err["body"]}`
            });
        }

        if (err instanceof ApiResponse) {
            res.statusMessage = err.statusMessage;
            return res.status(err.statusCode).send(err.res);
        }

        if (err instanceof ApiError) {
            res.statusMessage = err.statusMessage;
            return res.status(err.statusCode).json({ message: err.message });
        }

        if (err instanceof Error || err instanceof AssertionError) {
            log.error(err);
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }

        next();
    });

    const swaggerHtml = swaggerUi.generateHTML(JSON.parse((await fs.promises.readFile("build/swagger.json")).toString()));

    app.use("/api/v0/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
        return res.send(swaggerHtml);
    });

    app.use(function notFoundHandler(_req, res: ExResponse) {
        res.status(404).send({
            message: "Not Found"
        });
    });

    const handleExit = async (signal: NodeJS.Signals) => {
        log(`in handle exit (${signal})`);
        await Promise.all(Object.values(sharedSingleton.subs).map((sub) => sub.stop())); // Stop all running subs
        process.exit();
    };

    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handleExit));

    app.listen(plebbitApiPort, () =>
        console.log(
            `Plebbit API listening at http://localhost:${plebbitApiPort}\nYou can find API documentation at: http://localhost:${plebbitApiPort}/api/v0/docs`
        )
    );
}
