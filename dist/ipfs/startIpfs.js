"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIpfsNode = startIpfsNode;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const fsPromises = tslib_1.__importStar(require("fs/promises"));
const remeda = tslib_1.__importStar(require("remeda"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const kubo_1 = require("kubo");
const util_1 = require("../util");
async function getIpfsExePath() {
    return (0, kubo_1.path)();
}
// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows
function _spawnAsync(log, ...args) {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        const spawedProcess = (0, child_process_1.spawn)(...args);
        spawedProcess.on("exit", (exitCode, signal) => {
            if (exitCode === 0)
                resolve(null);
            else
                reject(Error(`spawnAsync process '${spawedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`));
        });
        spawedProcess.stderr.on("data", (data) => log.trace(data.toString()));
        spawedProcess.stdin.on("data", (data) => log.trace(data.toString()));
        spawedProcess.stdout.on("data", (data) => log.trace(data.toString()));
        spawedProcess.on("error", (data) => log.error(data.toString()));
    });
}
async function startIpfsNode(apiUrl, gatewayUrl, dataPath) {
    return new Promise(async (resolve, reject) => {
        const log = (await (0, util_1.getPlebbitLogger)())("plebbit-cli:ipfs:startIpfsNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path_1.default.join(dataPath, ".ipfs-plebbit-cli");
        await fs_1.default.promises.mkdir(ipfsDataPath, { recursive: true });
        const ipfsExePath = await getIpfsExePath();
        log(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);
        const env = { IPFS_PATH: ipfsDataPath, DEBUG_COLORS: "1" };
        try {
            await _spawnAsync(log, ipfsExePath, ["init"], { env, hideWindows: true });
        }
        catch (e) { }
        await _spawnAsync(log, ipfsExePath, ["config", "profile", "apply", `server`], {
            env,
            hideWindows: true
        });
        log("Called ipfs config profile apply successfully");
        const ipfsConfigPath = path_1.default.join(ipfsDataPath, "config");
        const ipfsConfig = JSON.parse((await fsPromises.readFile(ipfsConfigPath)).toString());
        const mergedIpfsConfig = {
            ...ipfsConfig,
            Addresses: {
                ...ipfsConfig["Addresses"],
                Gateway: `/ip4/${gatewayUrl.hostname}/tcp/${gatewayUrl.port}`,
                API: `/ip4/${apiUrl.hostname}/tcp/${apiUrl.port}`,
                Swarm: remeda
                    .unique([
                    ...ipfsConfig["Addresses"]["Swarm"],
                    "/ip4/0.0.0.0/tcp/4002/tls/sni/*.libp2p.direct/ws",
                    "/ip6/::/tcp/4002/tls/sni/*.libp2p.direct/ws"
                ])
                    .sort()
            },
            AutoTLS: {
                ...ipfsConfig["AutoTLS"],
                Enabled: true
            },
            Datastore: {
                GCPeriod: "1h",
                StorageGCWatermark: 90,
                StorageMax: "10GB",
                ...ipfsConfig["Datastore"]
            }
        };
        await fsPromises.writeFile(ipfsConfigPath, JSON.stringify(mergedIpfsConfig, null, 4));
        const daemonArgs = ["--enable-namesys-pubsub", "--migrate"];
        const ipfsProcess = (0, child_process_1.spawn)(ipfsExePath, ["daemon", ...daemonArgs], { env, cwd: process.cwd() });
        log.trace(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
        let lastError;
        ipfsProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            log.error(data.toString());
        });
        ipfsProcess.stdin.on("data", (data) => log.trace(data.toString()));
        ipfsProcess.stdout.on("data", (data) => {
            log.trace(data.toString());
            if (data.toString().match("Daemon is ready")) {
                (0, assert_1.default)(typeof ipfsProcess.pid === "number", `ipfsProcess.pid (${ipfsProcess.pid}) is not a valid pid`);
                resolve(ipfsProcess);
            }
        });
        ipfsProcess.on("error", (data) => log.error(data.toString()));
        ipfsProcess.on("exit", () => {
            console.error(`ipfs process with pid ${ipfsProcess.pid} exited`);
            reject(Error(lastError));
        });
    });
}
