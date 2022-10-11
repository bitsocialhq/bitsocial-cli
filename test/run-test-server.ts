import { startApi } from "../src/api/server.js";

if (
    typeof process.env["PLEBBIT_API_PORT"] !== "string" ||
    typeof process.env["IPFS_PUBSUB_PORT"] !== "string" ||
    typeof process.env["IPFS_PORT"] !== "string" ||
    typeof process.env["PLEBBIT_DATA_PATH"] !== "string"
)
    throw Error("You need to set all env variables PLEBBIT_API_PORT, IPFS_PUBSUB_PORT, IPFS_PORT, PLEBBIT_DATA_PATH");
startApi(
    parseInt(process.env["PLEBBIT_API_PORT"]),
    `http://localhost:${process.env["IPFS_PORT"]}/api/v0`,
    `http://localhost:${process.env["IPFS_PUBSUB_PORT"]}/api/v0`,
    process.env["PLEBBIT_DATA_PATH"]
);
