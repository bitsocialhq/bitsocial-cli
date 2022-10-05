// src/app.ts
import express, { Response as ExResponse, Request as ExRequest, json } from "express";
import { RegisterRoutes } from "../../build/routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs-extra";

const swaggerHtml = swaggerUi.generateHTML(JSON.parse((await fs.promises.readFile("build/swagger.json")).toString()));

export function startApi(apiPort: number) {
    const app = express();

    app.use(json());

    RegisterRoutes(app);

    app.use("/api/v0/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
        return res.send(swaggerHtml);
    });

    app.listen(apiPort, () => console.log(`Example app listening at http://localhost:${apiPort}`));
}

if (typeof process.env["PLEBBIT_API_PORT"] !== "string" || typeof process.env["IPFS_API_ENDPOINT"] !== "string")
    throw Error("You need to set both env variables PLEBBIT_API_PORT and IPFS_API_ENDPOINT");
startApi(parseInt(process.env["PLEBBIT_API_PORT"]), process.env["IPFS_API_ENDPOINT"]);
