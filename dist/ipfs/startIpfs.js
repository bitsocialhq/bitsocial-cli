"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKuboNode = startKuboNode;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const fsPromises = tslib_1.__importStar(require("fs/promises"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const kubo_1 = require("kubo");
const util_1 = require("../util");
async function getKuboExePath() {
    return (0, kubo_1.path)();
}
async function getKuboVersion() {
    try {
        const packageJsonPath = require.resolve("kubo/package.json");
        const packageJsonContent = await fsPromises.readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);
        return packageJson.version;
    }
    catch (error) {
        console.error("Failed to read kubo version:", error);
        return "unknown";
    }
}
// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows
function _spawnAsync(log, ...args) {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        const spawedProcess = (0, child_process_1.spawn)(...args);
        let errorMessage = "";
        spawedProcess.on("exit", (exitCode, signal) => {
            if (exitCode === 0)
                resolve(null);
            else {
                const error = new Error(errorMessage);
                Object.assign(error, { exitCode, pid: spawedProcess.pid, signal });
                reject(error);
            }
        });
        spawedProcess.stderr.on("data", (data) => {
            log.trace(data.toString());
            errorMessage += data.toString();
        });
        spawedProcess.stdin.on("data", (data) => log.trace(data.toString()));
        spawedProcess.stdout.on("data", (data) => log.trace(data.toString()));
        spawedProcess.on("error", (data) => {
            errorMessage += data.toString();
            log.error(data.toString());
        });
    });
}
async function startKuboNode(apiUrl, gatewayUrl, dataPath) {
    return new Promise(async (resolve, reject) => {
        const log = (await (0, util_1.getPlebbitLogger)())("plebbit-cli:ipfs:startKuboNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path_1.default.join(dataPath, ".plebbit-cli.ipfs");
        await fs_1.default.promises.mkdir(ipfsDataPath, { recursive: true });
        const kuboExePath = await getKuboExePath();
        const kuboVersion = await getKuboVersion();
        log(`Using Kubo version: ${kuboVersion}`);
        log(`IpfsDataPath (${ipfsDataPath}), kuboExePath (${kuboExePath})`, "kubo ipfs config file", path_1.default.join(ipfsDataPath, "config"));
        log("If you would like to change kubo config, please edit the config file at", path_1.default.join(ipfsDataPath, "config"));
        const env = { IPFS_PATH: ipfsDataPath, DEBUG_COLORS: "1" };
        try {
            await _spawnAsync(log, kuboExePath, ["init"], { env, hideWindows: true });
        }
        catch (e) {
            const error = e;
            if (!error?.message?.includes("ipfs configuration file already exists!"))
                throw new Error("Failed to call ipfs init" + error);
        }
        await _spawnAsync(log, kuboExePath, ["config", "profile", "apply", `server`], {
            env,
            hideWindows: true
        });
        log("Called 'ipfs config profile apply server' successfully");
        const ipfsConfigPath = path_1.default.join(ipfsDataPath, "config");
        const ipfsConfig = JSON.parse((await fsPromises.readFile(ipfsConfigPath)).toString());
        const mergedIpfsConfig = {
            ...ipfsConfig,
            Addresses: {
                ...ipfsConfig["Addresses"],
                Gateway: `/ip4/${gatewayUrl.hostname}/tcp/${gatewayUrl.port}`,
                API: `/ip4/${apiUrl.hostname}/tcp/${apiUrl.port}`
            },
            AutoTLS: {
                ...ipfsConfig["AutoTLS"],
                Enabled: true
            }
        };
        await fsPromises.writeFile(ipfsConfigPath, JSON.stringify(mergedIpfsConfig, null, 4));
        const daemonArgs = ["--enable-namesys-pubsub", "--migrate"];
        const kuboProcess = (0, child_process_1.spawn)(kuboExePath, ["daemon", ...daemonArgs], { env, cwd: process.cwd() });
        log.trace(`Kubo ipfs daemon process started with pid ${kuboProcess.pid} and args`, daemonArgs);
        let lastError;
        kuboProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            log.error(data.toString());
        });
        kuboProcess.stdin.on("data", (data) => log.trace(data.toString()));
        kuboProcess.stdout.on("data", (data) => {
            log.trace(data.toString());
            if (data.toString().match("Daemon is ready")) {
                (0, assert_1.default)(typeof kuboProcess.pid === "number", `kuboProcess.pid (${kuboProcess.pid}) is not a valid pid`);
                resolve(kuboProcess);
            }
        });
        kuboProcess.on("error", (data) => log.error(data.toString()));
        kuboProcess.on("exit", () => {
            log.error(`kubo ipfs process with pid ${kuboProcess.pid} exited`);
            reject(Error(lastError));
        });
    });
}
