"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("../src/api/server.js");
if (typeof process.env["PLEBBIT_API_PORT"] !== "string" ||
    typeof process.env["IPFS_PUBSUB_PORT"] !== "string" ||
    typeof process.env["IPFS_PORT"] !== "string" ||
    typeof process.env["PLEBBIT_DATA_PATH"] !== "string")
    throw Error("You need to set all env variables PLEBBIT_API_PORT, IPFS_PUBSUB_PORT, IPFS_PORT, PLEBBIT_DATA_PATH");
(0, server_js_1.startApi)(parseInt(process.env["PLEBBIT_API_PORT"]), `http://localhost:${process.env["IPFS_PORT"]}/api/v0`, `http://localhost:${process.env["IPFS_PUBSUB_PORT"]}/api/v0`, process.env["PLEBBIT_DATA_PATH"], undefined);
