"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Not sure 'defaults' is the best name here
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
exports.default = {
    PLEBBIT_DATA_PATH: (0, env_paths_1.default)("plebbit", { suffix: "" }).data,
    PLEBBIT_API_PORT: 32431,
    IPFS_API_PORT: 32429,
    IPFS_GATEWAY_PORT: 32430
};
