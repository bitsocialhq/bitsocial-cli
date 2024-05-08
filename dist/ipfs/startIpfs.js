"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIpfsNode = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = tslib_1.__importDefault(require("path"));
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const kubo_1 = require("kubo");
const util_1 = require("../util");
const paths = (0, env_paths_1.default)("plebbit", { suffix: "" });
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
async function startIpfsNode(apiPortNumber, gatewayPortNumber) {
    return new Promise(async (resolve, reject) => {
        const log = (await (0, util_1.getPlebbitLogger)())("plebbit-cli:ipfs:startIpfsNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path_1.default.join(paths.data, ".ipfs-cli");
        await fs_1.default.promises.mkdir(ipfsDataPath, { recursive: true });
        const ipfsExePath = await getIpfsExePath();
        log(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);
        const env = { IPFS_PATH: ipfsDataPath };
        try {
            await _spawnAsync(log, ipfsExePath, ["init"], { env, hideWindows: true });
        }
        catch (e) { }
        log("Called ipfs init successfully");
        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.Gateway", `/ip4/127.0.0.1/tcp/${gatewayPortNumber}`], {
            env,
            hideWindows: true
        });
        await _spawnAsync(log, ipfsExePath, ["config", "profile", "apply", `server`], {
            env,
            hideWindows: true
        });
        log("Called ipfs config Addresses.Gateway successfully");
        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.API", `/ip4/127.0.0.1/tcp/${apiPortNumber}`], { env, hideWindows: true });
        log("Called ipfs config Addresses.API successfully");
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
exports.startIpfsNode = startIpfsNode;
