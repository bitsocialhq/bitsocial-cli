"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const startIpfs_js_1 = require("../src/ipfs/startIpfs.js");
if (typeof process.env["IPFS_API_PORT"] !== "string" || typeof process.env["IPFS_GATEWAY_PORT"] !== "string")
    throw Error("You need to set both env variables IPFS_API_PORT and IPFS_GATEWAY_PORT");
(0, startIpfs_js_1.startIpfsNode)(parseInt(process.env["IPFS_API_PORT"]), parseInt(process.env["IPFS_GATEWAY_PORT"]), true);
