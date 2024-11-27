"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Not sure 'defaults' is the best name here
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
exports.default = {
    PLEBBIT_DATA_PATH: (0, env_paths_1.default)("plebbit", { suffix: "" }).data,
    PLEBBIT_RPC_URL: new URL("ws://localhost:9138"),
    IPFS_API_URL: new URL("http://127.0.0.1:5001/api/v0"),
    IPFS_GATEWAY_URL: new URL("http://127.0.0.1:6473"),
    HTTP_TRACKERS: ["https://peers.pleb.bot", "https://routing.lol"],
    PLEBBIT_LOG_PATH: (0, env_paths_1.default)("plebbit", { suffix: "" }).log
};
