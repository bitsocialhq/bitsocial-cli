"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIpfsNode = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = tslib_1.__importDefault(require("path"));
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const assert_1 = tslib_1.__importDefault(require("assert"));
//@ts-ignore
const go_ipfs_1 = require("go-ipfs");
const paths = (0, env_paths_1.default)("plebbit", { suffix: "" });
const log = (0, plebbit_logger_1.default)("plebbit-cli:startIpfsNode");
// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows
function _spawnAsync(...args) {
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
async function startIpfsNode(apiPortNumber, gatewayPortNumber, testing) {
    return new Promise(async (resolve, reject) => {
        const ipfsDataPath = process.env["IPFS_PATH"] || path_1.default.join(paths.data, "ipfs");
        await fs_extra_1.default.mkdirp(ipfsDataPath);
        const ipfsExePath = (0, go_ipfs_1.path)();
        log.trace(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);
        await fs_extra_1.default.ensureDir(ipfsDataPath);
        await fs_extra_1.default.ensureFile(ipfsExePath);
        const env = { IPFS_PATH: ipfsDataPath };
        try {
            await _spawnAsync(ipfsExePath, ["init"], { env, hideWindows: true });
        }
        catch (e) { }
        await _spawnAsync(ipfsExePath, ["config", "Addresses.Gateway", `/ip4/127.0.0.1/tcp/${gatewayPortNumber}`], {
            env,
            hideWindows: true
        });
        await _spawnAsync(ipfsExePath, ["config", "Addresses.API", `/ip4/127.0.0.1/tcp/${apiPortNumber}`], { env, hideWindows: true });
        if (testing)
            await _spawnAsync(ipfsExePath, ["bootstrap", "rm", "--all"], { env });
        const daemonArgs = process.env["OFFLINE_MODE"] === "1" ? ["--offline"] : ["--enable-pubsub-experiment", "--enable-namesys-pubsub"];
        const ipfsProcess = (0, child_process_1.spawn)(ipfsExePath, ["daemon", ...daemonArgs], { env });
        log.trace(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
        let lastError;
        ipfsProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            log.error(data.toString());
        });
        ipfsProcess.stdin.on("data", (data) => log.trace(data.toString()));
        ipfsProcess.stdout.on("data", (data) => {
            if (data.toString().match("Daemon is ready")) {
                (0, assert_1.default)(typeof ipfsProcess.pid === "number", `ipfsProcess.pid (${ipfsProcess.pid}) is not a valid pid`);
                if (testing)
                    console.log(data.toString());
                resolve({ pid: ipfsProcess.pid });
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
