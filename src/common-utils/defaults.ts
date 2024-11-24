// Not sure 'defaults' is the best name here
import envPaths from "env-paths";

export default {
    PLEBBIT_DATA_PATH: envPaths("plebbit", { suffix: "" }).data,
    PLEBBIT_RPC_URL: new URL("ws://localhost:9138"),
    IPFS_API_URL: new URL("http://127.0.0.1:5001/api/v0"),
    IPFS_GATEWAY_URL: new URL("http://127.0.0.1:6473"),
    HTTP_TRACKERS: ["https://peers.pleb.bot", "https://routing.lol"],
    PLEBBIT_LOG_PATH: envPaths("plebbit", { suffix: "" }).log
};
