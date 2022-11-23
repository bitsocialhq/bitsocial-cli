// Not sure 'defaults' is the best name here
import envPaths from "env-paths";
export default {
    PLEBBIT_DATA_PATH: envPaths("plebbit", { suffix: "" }).data,
    PLEBBIT_API_PORT: 32431,
    IPFS_API_PORT: 32429,
    IPFS_GATEWAY_PORT: 32430
};
