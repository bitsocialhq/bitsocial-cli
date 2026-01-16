// Not sure 'defaults' is the best name here
import envPaths from "env-paths";

export default {
    PLEBBIT_DATA_PATH: envPaths("bitsocial", { suffix: "" }).data,
    PLEBBIT_RPC_URL: new URL("ws://localhost:9138"),
    KUBO_RPC_URL: new URL("http://127.0.0.1:50019/api/v0"),
    IPFS_GATEWAY_URL: new URL("http://127.0.0.1:6473"),
    HTTP_TRACKERS: ["https://peers.pleb.bot", "https://routing.lol", "https://peers.forumindex.com", "https://peers.plebpubsub.xyz"],
    PLEBBIT_LOG_PATH: envPaths("bitsocial", { suffix: "" }).log
};
