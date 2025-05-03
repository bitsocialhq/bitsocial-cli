import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import envPaths from "env-paths";
import fs from "fs";
import * as fsPromises from "fs/promises";
import * as remeda from "remeda";
import assert from "assert";
import { path as ipfsExePathFunc } from "kubo";
import { getPlebbitLogger } from "../util";

async function getKuboExePath(): Promise<string> {
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
export async function startKuboNode(apiUrl: URL, gatewayUrl: URL, dataPath: string): Promise<ChildProcessWithoutNullStreams> {
    return new Promise(async (resolve, reject) => {
        const log = (await getPlebbitLogger())("plebbit-cli:ipfs:startKuboNode");
        const ipfsDataPath = process.env["IPFS_PATH"] || path.join(dataPath, ".plebbit-cli.ipfs");
        await fs.promises.mkdir(ipfsDataPath, { recursive: true });

        const kuboExePath = await getKuboExePath();
        log(`IpfsDataPath (${ipfsDataPath}), kuboExePath (${kuboExePath})`, "kubo ipfs config file", path.join(ipfsDataPath, "config"));

        const env = { IPFS_PATH: ipfsDataPath, DEBUG_COLORS: "1" };

        try {
            await _spawnAsync(log, kuboExePath, ["init"], { env, hideWindows: true });
        } catch (e) {
            const error = <Error>e;
            if (!error?.message?.includes("ipfs configuration file already exists!")) throw new Error("Failed to call ipfs init" + error);
        }

        await _spawnAsync(log, kuboExePath, ["config", "profile", "apply", `server`], {
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
                API: `/ip4/${apiUrl.hostname}/tcp/${apiUrl.port}`
            },
            AutoTLS: {
                ...ipfsConfig["AutoTLS"],
                Enabled: true
            }
        };

        await fsPromises.writeFile(ipfsConfigPath, JSON.stringify(mergedIpfsConfig, null, 4));

        const daemonArgs = ["--enable-namesys-pubsub", "--migrate"];

        const kuboProcess: ChildProcessWithoutNullStreams = spawn(kuboExePath, ["daemon", ...daemonArgs], { env, cwd: process.cwd() });
        log.trace(`Kubo ipfs daemon process started with pid ${kuboProcess.pid}`);
        let lastError: string;
        kuboProcess.stderr.on("data", (data) => {
            lastError = data.toString();
            log.error(data.toString());
        });
        kuboProcess.stdin.on("data", (data) => log.trace(data.toString()));
        kuboProcess.stdout.on("data", (data) => {
            log.trace(data.toString());
            if (data.toString().match("Daemon is ready")) {
                assert(typeof kuboProcess.pid === "number", `kuboProcess.pid (${kuboProcess.pid}) is not a valid pid`);
                resolve(kuboProcess);
            }
        });
        kuboProcess.on("error", (data) => log.error(data.toString()));
        kuboProcess.on("exit", () => {
            console.error(`kubo ipfs process with pid ${kuboProcess.pid} exited`);
            reject(Error(lastError));
        });
    });
}
