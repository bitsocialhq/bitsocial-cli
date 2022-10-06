// src/app.ts
import express, { Response as ExResponse, Request as ExRequest, json } from "express";
import { RegisterRoutes } from "../../build/routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs-extra";
import envPaths from "env-paths";
import Plebbit from "@plebbit/plebbit-js";
import { SharedSingleton } from "../types.js";

const swaggerHtml = swaggerUi.generateHTML(JSON.parse((await fs.promises.readFile("build/swagger.json")).toString()));

const paths = envPaths("plebbit", { suffix: "" });

export let sharedSingleton: SharedSingleton;

export async function startApi(apiPort: number, ipfsApiEndpoint: string) {
    sharedSingleton = { plebbit: await Plebbit({ ipfsHttpClientOptions: ipfsApiEndpoint, dataPath: paths.data }) };
    const app = express();

    app.use(json());

    RegisterRoutes(app);

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
