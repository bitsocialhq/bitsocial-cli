import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import envPaths from "env-paths";
import Logger from "@plebbit/plebbit-logger";
import { promises as fsPromises } from "fs";
import fs from "fs";
import assert from "assert";
import { path as ipfsExePathFunc } from "kubo";

const paths = envPaths("plebbit", { suffix: "" });

async function getIpfsExePath(): Promise<string> {
    const log = Logger("plebbit-cli:ipfs:getIpfsExePath");

    // If the app is packaged with 'pkg' as a single binary, we have to copy the ipfs binary somewhere so we can execute it
    //@ts-ignore
    if (process.pkg) {
        // creating a temporary folder for our executable file
        const destinationPath = path.join(paths.data, "ipfs_binary", path.basename(ipfsExePathFunc()));
        await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });

        const ipfsAsset = await fsPromises.open(ipfsExePathFunc());
        const ipfsAssetStat = await ipfsAsset.stat();

        let dst: fsPromises.FileHandle | undefined, dstStat: fs.Stats | undefined;
        try {
            dst = await fsPromises.open(destinationPath);
            dstStat = await dst.stat();
        } catch {}

        log.trace(`Ipfs asset size: ${ipfsAssetStat.size}, dst size: ${dstStat?.size}`);
        if (dstStat?.size !== ipfsAssetStat.size) {
            log(`Copying ipfs binary to ${destinationPath}`);
            await fsPromises.copyFile(ipfsExePathFunc(), destinationPath);
            await fsPromises.chmod(destinationPath, 0o775);
        }

        await ipfsAsset.close();
        if (dst) await dst.close();

        return destinationPath;
    } else return ipfsExePathFunc();
}

// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows

function _spawnAsync(log: Logger, ...args: any[]) {
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
export async function startIpfsNode(
    apiPortNumber: number,
    gatewayPortNumber: number,
    testing: boolean
): Promise<ChildProcessWithoutNullStreams> {
    return new Promise(async (resolve, reject) => {
        const log = Logger("plebbit-cli:ipfs:startIpfsNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path.join(paths.data, ".ipfs-cli");
        await fs.promises.mkdir(ipfsDataPath, { recursive: true });

        const ipfsExePath = await getIpfsExePath();
        log.trace(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);

        const env = { IPFS_PATH: ipfsDataPath };

        try {
            await _spawnAsync(log, ipfsExePath, ["init"], { env, hideWindows: true });
        } catch (e) {}

        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.Gateway", `/ip4/127.0.0.1/tcp/${gatewayPortNumber}`], {
            env,
            hideWindows: true
        });

        await _spawnAsync(log, ipfsExePath, ["config", "Addresses.API", `/ip4/127.0.0.1/tcp/${apiPortNumber}`], { env, hideWindows: true });

        if (testing) await _spawnAsync(log, ipfsExePath, ["bootstrap", "rm", "--all"], { env });

        const daemonArgs =
            process.env["OFFLINE_MODE"] === "1" ? ["--offline"] : ["--enable-pubsub-experiment", "--enable-namesys-pubsub", "--migrate"];

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
                if (testing) console.log(data.toString());
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
