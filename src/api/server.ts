import express, { Response as ExResponse, Request as ExRequest, json, NextFunction } from "express";
import { RegisterRoutes } from "../../build/routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs-extra";
import envPaths from "env-paths";
import Plebbit from "@plebbit/plebbit-js";
import { SharedSingleton } from "../types.js";
import { ValidateError } from "tsoa";
import { AssertionError } from "assert";
import Logger from "@plebbit/plebbit-logger";
import { statusCodes, statusMessages } from "./ResponseStatuses.js";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";

const swaggerHtml = swaggerUi.generateHTML(JSON.parse((await fs.promises.readFile("build/swagger.json")).toString()));

const paths = envPaths("plebbit", { suffix: "" });

export let sharedSingleton: SharedSingleton;

export async function startApi(apiPort: number, ipfsApiEndpoint: string, ipfsPubsubApiEndpoint: string) {
    const log = Logger("plebbit-cli:server");
    sharedSingleton = {
        plebbit: await Plebbit({
            ipfsHttpClientOptions: ipfsApiEndpoint,
            pubsubHttpClientOptions: ipfsPubsubApiEndpoint,
            dataPath: paths.data
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

    app.use("/api/v0/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
        return res.send(swaggerHtml);
    });

    app.use(function notFoundHandler(_req, res: ExResponse) {
        res.status(404).send({
            message: "Not Found"
        });
    });

    process.on("exit", async () => {
        await Promise.all(Object.values(sharedSingleton.subs).map((sub) => sub.stop())); // Stop all running subs
    });

    app.listen(apiPort, () =>
        console.log(
            `Plebbit API listening at http://localhost:${apiPort}\nYou can find API documentation at: http://localhost:${apiPort}/api/v0/docs`
        )
    );
}

if (
    typeof process.env["PLEBBIT_API_PORT"] !== "string" ||
    typeof process.env["IPFS_PUBSUB_PORT"] !== "string" ||
    typeof process.env["IPFS_PORT"] !== "string"
)
    throw Error("You need to set all env variables PLEBBIT_API_PORT, IPFS_PUBSUB_PORT, IPFS_PORT");
startApi(
    parseInt(process.env["PLEBBIT_API_PORT"]),
    `http://localhost:${process.env["IPFS_PORT"]}/api/v0`,
    `http://localhost:${process.env["IPFS_PUBSUB_PORT"]}/api/v0`
);
