import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import envPaths from "env-paths";
import fs from "fs";
import * as fsPromises from "fs/promises";
import * as remeda from "remeda";
import assert from "assert";
import { path as ipfsExePathFunc } from "kubo";
import { getPlebbitLogger } from "../util";

async function getIpfsExePath(): Promise<string> {
    return ipfsExePathFunc();
}

// use this custom function instead of spawnSync for better logging
// also spawnSync might have been causing crash on start on windows

function _spawnAsync(log: any, ...args: any[]) {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        const spawedProcess: ChildProcessWithoutNullStreams = spawn(...args);
        let errorMessage = "";
        spawedProcess.on("exit", (exitCode, signal) => {
            if (exitCode === 0) resolve(null);
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
export async function startIpfsNode(apiUrl: URL, gatewayUrl: URL, dataPath: string): Promise<ChildProcessWithoutNullStreams> {
    return new Promise(async (resolve, reject) => {
        const log = (await getPlebbitLogger())("plebbit-cli:ipfs:startIpfsNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path.join(dataPath, ".ipfs-plebbit-cli");
        await fs.promises.mkdir(ipfsDataPath, { recursive: true });

        const ipfsExePath = await getIpfsExePath();
        log(`IpfsDataPath (${ipfsDataPath}), ipfsExePath (${ipfsExePath})`);

        const env = { IPFS_PATH: ipfsDataPath, DEBUG_COLORS: "1" };

        try {
            await _spawnAsync(log, ipfsExePath, ["init"], { env, hideWindows: true });
        } catch (e) {
            const error = <Error>e;
            if (!error?.message?.includes("ipfs configuration file already exists!")) throw new Error("Failed to call ipfs init" + error);
        }

        await _spawnAsync(log, ipfsExePath, ["config", "profile", "apply", `server`], {
            env,
            hideWindows: true
        });
        log("Called 'ipfs config profile apply server' successfully");

        const ipfsConfigPath = path.join(ipfsDataPath, "config");
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
            }
        };

        await fsPromises.writeFile(ipfsConfigPath, JSON.stringify(mergedIpfsConfig, null, 4));

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
