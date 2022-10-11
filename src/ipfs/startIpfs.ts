import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import envPaths from "env-paths";
import Logger from "@plebbit/plebbit-logger";
import fs from "fs-extra";
import assert from "assert";

const paths = envPaths("plebbit", { suffix: "" });
const log = Logger("plebbit-cli:startIpfsNode");

function _getIpfsExecutablePath(): string {
    const platform: "linux" | "mac" | "win" | undefined =
        process.platform === "win32" ? "win" : process.platform === "linux" ? "linux" : process.platform === "darwin" ? "mac" : undefined;
    if (!platform) throw Error(`Platform (${process.platform}) is not supported`);

    return path.join(process.cwd(), "assets", platform, platform === "win" ? "ipfs.exe" : "ipfs");
}

// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows

function _spawnAsync(...args: any[]) {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        const spawedProcess: ChildProcessWithoutNullStreams = spawn(...args);
        spawedProcess.on("exit", (exitCode, signal) => {
            if (exitCode === 0) resolve(null);
            else reject(Error(`spawnAsync process '${spawedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`));
        });
        spawedProcess.stderr.on("data", (data) => log.trace(data.toString()));
        spawedProcess.stdin.on("data", (data) => log.trace(data.toString()));
        spawedProcess.stdout.on("data", (data) => log.trace(data.toString()));
        spawedProcess.on("error", (data) => log.error(data.toString()));
    });
}
export async function startIpfsNode(apiPortNumber: number, gatewayPortNumber: number, testing: boolean): Promise<{ pid: number }> {
    return new Promise(async (resolve, reject) => {
        await fs.mkdirp(paths.data);

        const ipfsDataPath = process.env["IPFS_PATH"] || path.join(paths.data, "ipfs");
        const ipfsExePath = _getIpfsExecutablePath();
        log.trace(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);
        await fs.ensureDir(ipfsDataPath);
        await fs.ensureFile(ipfsExePath);

        const env = { IPFS_PATH: ipfsDataPath };

        try {
            await _spawnAsync(ipfsExePath, ["init"], { env, hideWindows: true });
        } catch (e) {}

        await _spawnAsync(ipfsExePath, ["config", "Addresses.Gateway", `/ip4/127.0.0.1/tcp/${gatewayPortNumber}`], {
            env,
            hideWindows: true
        });

        await _spawnAsync(ipfsExePath, ["config", "Addresses.API", `/ip4/127.0.0.1/tcp/${apiPortNumber}`], { env, hideWindows: true });

        if (testing) await _spawnAsync(ipfsExePath, ["bootstrap", "rm", "--all"], { env });

        const daemonArgs = process.env["OFFLINE_MODE"] === "1" ? ["--offline"] : ["--enable-pubsub-experiment", "--enable-namesys-pubsub"];

        const ipfsProcess: ChildProcessWithoutNullStreams = spawn(ipfsExePath, ["daemon", ...daemonArgs], { env });
        log.trace(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
        let lastError: string;
        ipfsProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            log.error(data.toString());
        });
        ipfsProcess.stdin.on("data", (data) => log.trace(data.toString()));
        ipfsProcess.stdout.on("data", (data) => {
            if (data.toString().match("Daemon is ready")) {
                assert(typeof ipfsProcess.pid === "number", `ipfsProcess.pid (${ipfsProcess.pid}) is not a valid pid`);
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
