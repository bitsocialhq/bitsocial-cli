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
import { ApiInputError } from "./errors.js";

const swaggerHtml = swaggerUi.generateHTML(JSON.parse((await fs.promises.readFile("build/swagger.json")).toString()));

const paths = envPaths("plebbit", { suffix: "" });

export let sharedSingleton: SharedSingleton;

export async function startApi(apiPort: number, ipfsApiEndpoint: string) {
    const log = Logger("plebbit-cli:server");
    sharedSingleton = { plebbit: await Plebbit({ ipfsHttpClientOptions: ipfsApiEndpoint, dataPath: paths.data }) };
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
            res.statusMessage = "Request body is invalid as a JSON"; // TODO standarize error codes
            //@ts-ignore
            return res.status(400).json({ message: "Request body is invalid as a JSON", details: `${err.message}\n${err["body"]}` });
        }

        if (err instanceof ApiInputError) return res.status(err.statusCode).json({ message: err.message });

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

    app.listen(apiPort, () =>
        console.log(
            `Plebbit API listening at http://localhost:${apiPort}\nYou can find API documentation at: http://localhost:${apiPort}/api/v0/docs`
        )
    );
}

if (typeof process.env["PLEBBIT_API_PORT"] !== "string" || typeof process.env["IPFS_API_ENDPOINT"] !== "string")
    throw Error("You need to set both env variables PLEBBIT_API_PORT and IPFS_API_ENDPOINT");
startApi(parseInt(process.env["PLEBBIT_API_PORT"]), process.env["IPFS_API_ENDPOINT"]);
