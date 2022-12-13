"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIpfsNode = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = tslib_1.__importDefault(require("path"));
const env_paths_1 = tslib_1.__importDefault(require("env-paths"));
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const fs_1 = require("fs");
const fs_2 = tslib_1.__importDefault(require("fs"));
const assert_1 = tslib_1.__importDefault(require("assert"));
//@ts-ignore
const go_ipfs_1 = require("go-ipfs");
const paths = (0, env_paths_1.default)("plebbit", { suffix: "" });
async function getIpfsExePath() {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:ipfs:getIpfsExePath");
    // If the app is packaged with 'pkg' as a single binary, we have to copy the ipfs binary somewhere so we can execute it
    //@ts-ignore
    if (process.pkg) {
        // creating a temporary folder for our executable file
        const destinationPath = path_1.default.join(paths.data, "ipfs_binary", path_1.default.basename((0, go_ipfs_1.path)()));
        await fs_2.default.promises.mkdir(path_1.default.dirname(destinationPath), { recursive: true });
        const ipfsAsset = await fs_1.promises.open((0, go_ipfs_1.path)());
        const ipfsAssetStat = await ipfsAsset.stat();
        let dst, dstStat;
        try {
            dst = await fs_1.promises.open(destinationPath);
            dstStat = await dst.stat();
        }
        catch { }
        log.trace(`Ipfs asset size: ${ipfsAssetStat.size}, dst size: ${dstStat?.size}`);
        if (dstStat?.size !== ipfsAssetStat.size) {
            log(`Copying ipfs binary to ${destinationPath}`);
            await fs_1.promises.copyFile((0, go_ipfs_1.path)(), destinationPath);
            await fs_1.promises.chmod(destinationPath, 0o775);
        }
        await ipfsAsset.close();
        if (dst)
            await dst.close();
        return destinationPath;
    }
    else
        return (0, go_ipfs_1.path)();
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
async function startIpfsNode(apiPortNumber, gatewayPortNumber, testing) {
    return new Promise(async (resolve, reject) => {
        const log = (0, plebbit_logger_1.default)("plebbit-cli:ipfs:startIpfsNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path_1.default.join(paths.data, ".ipfs-cli");
        await fs_2.default.promises.mkdir(ipfsDataPath, { recursive: true });
        const ipfsExePath = await getIpfsExePath();
        log.trace(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);
        const env = { IPFS_PATH: ipfsDataPath };
        try {
            await _spawnAsync(log, ipfsExePath, ["init"], { env, hideWindows: true });
        }
        catch (e) { }
        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.Gateway", `/ip4/127.0.0.1/tcp/${gatewayPortNumber}`], {
            env,
            hideWindows: true
        });
        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.API", `/ip4/127.0.0.1/tcp/${apiPortNumber}`], { env, hideWindows: true });
        if (testing)
            await _spawnAsync(log, ipfsExePath, ["bootstrap", "rm", "--all"], { env });
        const daemonArgs = process.env["OFFLINE_MODE"] === "1" ? ["--offline"] : ["--enable-pubsub-experiment", "--enable-namesys-pubsub"];
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
                if (testing)
                    console.log(data.toString());
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
