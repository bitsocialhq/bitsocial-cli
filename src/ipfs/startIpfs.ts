import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import envPaths from "env-paths";
import fs from "fs";
import assert from "assert";
import { path as ipfsExePathFunc } from "kubo";
import { getPlebbitLogger } from "../util";

const paths = envPaths("plebbit", { suffix: "" });

async function getIpfsExePath(): Promise<string> {
    return ipfsExePathFunc();
}

// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows

function _spawnAsync(log: any, ...args: any[]) {
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
export async function startIpfsNode(apiPortNumber: number, gatewayPortNumber: number): Promise<ChildProcessWithoutNullStreams> {
    return new Promise(async (resolve, reject) => {
        const log = (await getPlebbitLogger())("plebbit-cli:ipfs:startIpfsNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path.join(paths.data, ".ipfs-cli");
        await fs.promises.mkdir(ipfsDataPath, { recursive: true });

        const ipfsExePath = await getIpfsExePath();
        log.trace(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);

        const env = { IPFS_PATH: ipfsDataPath };

        try {
            await _spawnAsync(log, ipfsExePath, ["init"], { env, hideWindows: true });
        } catch (e) {}

        log("Called ipfs init successfully");
        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.Gateway", `/ip4/127.0.0.1/tcp/${gatewayPortNumber}`], {
            env,
            hideWindows: true
        });

        log("Called ipfs config Addresses.Gateway successfully");

        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.API", `/ip4/127.0.0.1/tcp/${apiPortNumber}`], { env, hideWindows: true });

        log("Called ipfs config Addresses.API successfully");

        const daemonArgs = ["--enable-namesys-pubsub", "--migrate"];

        const ipfsProcess: ChildProcessWithoutNullStreams = spawn(ipfsExePath, ["daemon", ...daemonArgs], { env, cwd: process.cwd() });
        log.trace(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
        let lastError: string;
        ipfsProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            log.error(data.toString());
        });
        ipfsProcess.stdin.on("data", (data) => log.trace(data.toString()));
        ipfsProcess.stdout.on("data", (data) => {
            log.trace(data.toString());
            if (data.toString().match("Daemon is ready")) {
                assert(typeof ipfsProcess.pid === "number", `ipfsProcess.pid (${ipfsProcess.pid}) is not a valid pid`);
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
