// src/app.ts
import express, { json } from "express";
import { RegisterRoutes } from "../../build/routes.js";

export function startApi(apiPort: number) {
    const app = express();

    app.use(json());

    RegisterRoutes(app);

    app.listen(apiPort, () => console.log(`Example app listening at http://localhost:${apiPort}`));
}

startApi(parseInt(<string>process.env["PORT"]) || 32431);
