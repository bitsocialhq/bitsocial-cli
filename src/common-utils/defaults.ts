// Not sure 'defaults' is the best name here
import envPaths from "env-paths";

export default {
    PLEBBIT_DATA_PATH: envPaths("plebbit", { suffix: "" }).data,
    PLEBBIT_RPC_API_PORT: 9138,
    IPFS_API_PORT: 5001,
    IPFS_GATEWAY_PORT: 6473
};