"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Not sure 'defaults' is the best name here
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
exports.default = {
    PLEBBIT_DATA_PATH: (0, env_paths_1.default)("plebbit", { suffix: "" }).data,
    PLEBBIT_RPC_API_PORT: 9138,
    IPFS_API_PORT: 5001,
    IPFS_GATEWAY_PORT: 6473,
    PLEBBIT_LOG_PATH: (0, env_paths_1.default)("plebbit", { suffix: "" }).log
};
