import express, { Response as ExResponse, Request as ExRequest, json, NextFunction } from "express";
import { RegisterRoutes } from "../../build/routes.js";
import swaggerJson from "../../build/swagger.json";
import swaggerUi from "swagger-ui-express";
import Plebbit from "@plebbit/plebbit-js";
import { SharedSingleton } from "./types.js";
import { ValidateError } from "tsoa";
import assert, { AssertionError } from "assert";
import { statusCodes, statusMessages } from "./response-statuses.js";
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";
import { seedSubplebbits } from "./seeder.js";
import Logger from "@plebbit/plebbit-logger";

export let sharedSingleton: SharedSingleton;

export async function startApi(
    plebbitApiPort: number,
    ipfsApiEndpoint: string,
    ipfsPubsubApiEndpoint: string,
    plebbitDataPath: string,
    seedSubs: string[] | undefined
) {
    const log = Logger("plebbit-cli:server");
    sharedSingleton = {
        plebbit: await Plebbit({
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            pubsubHttpClientsOptions: [ipfsPubsubApiEndpoint],
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

    const swaggerHtml = swaggerUi.generateHTML(swaggerJson);
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

    app.listen(plebbitApiPort, () => {
        console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
        const gateway = Object.keys(sharedSingleton.plebbit.clients.ipfsGateways)[0];
        assert(typeof gateway === "string");
        console.log(`IPFS Gateway listening on: ${gateway.replace("127.0.0.1", "localhost")}`);
        console.log(`Plebbit API listening on: http://localhost:${plebbitApiPort}/api/v0`);
        console.log(`You can find Plebbit API documentation at: http://localhost:${plebbitApiPort}/api/v0/docs`);
        if (Array.isArray(seedSubs)) {
            console.log(`Seeding subplebbits:`, seedSubs);
            seedSubplebbits(seedSubs, sharedSingleton.plebbit);
            setInterval(() => seedSubplebbits(seedSubs, sharedSingleton.plebbit), 600000); // Seed subs every 10 minutes
        }
    });
}
