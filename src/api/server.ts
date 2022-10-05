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

startApi(parseInt(<string>process.env["PORT"]) || 32431);
