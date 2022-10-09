import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import envPaths from "env-paths";
import Logger from "@plebbit/plebbit-logger";
import fs from "fs-extra";
import assert from "assert";

const paths = envPaths("plebbit", { suffix: "" });

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
        spawedProcess.stderr.on("data", (data) => console.error(data.toString()));
        spawedProcess.stdin.on("data", (data) => console.log(data.toString()));
        spawedProcess.stdout.on("data", (data) => console.log(data.toString()));
        spawedProcess.on("error", (data) => console.error(data.toString()));
    });
}
async function startIpfsNode(apiPortNumber: number, gatewayPortNumber: number): Promise<{ pid: number }> {
    return new Promise(async (resolve, reject) => {
        const log = Logger("plebbit-cli:startIpfsNode");

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

        await _spawnAsync(ipfsExePath, ["bootstrap", "rm", "--all"], { env });

        const daemonArgs = process.env["OFFLINE_MODE"] === "1" ? ["--offline"] : ["--enable-pubsub-experiment", "--enable-namesys-pubsub"];

        const ipfsProcess: ChildProcessWithoutNullStreams = spawn(ipfsExePath, ["daemon", ...daemonArgs], { env });
        console.log(`ipfs daemon process started with pid ${ipfsProcess.pid}`);
        let lastError: string;
        ipfsProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            console.error(data.toString());
        });
        ipfsProcess.stdin.on("data", (data) => console.log(data.toString()));
        ipfsProcess.stdout.on("data", (data) => {
            console.log(data.toString());
            if (typeof data === "string" && data.match("Daemon is ready")) {
                assert(typeof ipfsProcess.pid === "number", `ipfsProcess.pid (${ipfsProcess.pid}) is not a valid pid`);
                resolve({ pid: ipfsProcess.pid });
            }
        });
        ipfsProcess.on("error", (data) => console.error(data.toString()));
        ipfsProcess.on("exit", () => {
            console.error(`ipfs process with pid ${ipfsProcess.pid} exited`);
            reject(Error(lastError));
        });
    });
}

export default startIpfsNode;

if (typeof process.env["IPFS_API_PORT"] !== "string" || typeof process.env["IPFS_GATEWAY_PORT"] !== "string")
    throw Error("You need to set both env variables IPFS_API_PORT and IPFS_GATEWAY_PORT");

await startIpfsNode(parseInt(process.env["IPFS_API_PORT"]), parseInt(process.env["IPFS_GATEWAY_PORT"])); // For "yarn dev"
