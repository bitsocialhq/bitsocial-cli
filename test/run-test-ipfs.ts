import { startIpfsNode } from "../src/ipfs/startIpfs.js";

if (typeof process.env["IPFS_API_PORT"] !== "string" || typeof process.env["IPFS_GATEWAY_PORT"] !== "string")
    throw Error("You need to set both env variables IPFS_API_PORT and IPFS_GATEWAY_PORT");

await startIpfsNode(parseInt(process.env["IPFS_API_PORT"]), parseInt(process.env["IPFS_GATEWAY_PORT"]), true);
