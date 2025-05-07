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

async function getKuboVersion(): Promise<string> {
    try {
        const packageJsonPath = require.resolve("kubo/package.json");
        const packageJsonContent = await fsPromises.readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);
        return packageJson.version;
    } catch (error) {
        console.error("Failed to read kubo version:", error);
        return "unknown";
    }
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
        const kuboVersion = await getKuboVersion();
        log(`Using Kubo version: ${kuboVersion}`);
        log(`IpfsDataPath (${ipfsDataPath}), kuboExePath (${kuboExePath})`, "kubo ipfs config file", path.join(ipfsDataPath, "config"));
        log("If you would like to change kubo config, please edit the config file at", path.join(ipfsDataPath, "config"));

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

        const kuboProcess: ChildProcessWithoutNullStreams = spawn(kuboExePath, ["daemon", ...daemonArgs], {
            env,
            cwd: process.cwd(),
            detached: true
        });
        log.trace(`Kubo ipfs daemon process started with pid ${kuboProcess.pid} and args`, daemonArgs);

        let lastError: string = "Kubo process exited before Daemon was ready."; // Default error for premature exit
        let daemonReady = false;

        // Define handlers upfront to allow removal
        const onProcessExit = () => {
            if (!daemonReady) {
                // Only reject if daemon wasn't ready (i.e., startup failed)
                log.error(`Kubo ipfs process with pid ${kuboProcess.pid} exited prematurely. Last error: ${lastError}`);
                // Clean up all listeners associated with this promise to prevent multiple rejections or logs from this context
                kuboProcess.removeAllListeners();
                reject(new Error(lastError));
            } else {
                // If daemon was already ready, this exit is handled by listeners in daemon.ts (e.g., keepKuboUp or asyncExitHook)
                log.trace(`Kubo ipfs process with pid ${kuboProcess.pid} exited after daemon was ready.`);
            }
        };

        const onProcessError = (err: Error) => {
            lastError = err.message || "Kubo process encountered an error during startup.";
            log.error(`Kubo process error: ${lastError}`);
            if (!daemonReady) {
                // Only reject if daemon wasn't ready
                kuboProcess.removeAllListeners();
                reject(err);
            }
        };

        const onDaemonReadyOutput = (data: Buffer | string) => {
            const output = data.toString();
            log.trace(output);
            if (output.match("Daemon is ready")) {
                daemonReady = true;
                assert(typeof kuboProcess.pid === "number", `kuboProcess.pid (${kuboProcess.pid}) is not a valid pid`);

                // IMPORTANT: Remove promise-specific handlers once startup is successful
                kuboProcess.removeListener("exit", onProcessExit);
                kuboProcess.removeListener("error", onProcessError);
                // Stderr listener can remain for ongoing logging if desired, or be removed too.
                // kuboProcess.stderr.removeListener("data", onStderrData); // If you want to stop this specific stderr logging

                resolve(kuboProcess);
            }
        };

        const onStderrData = (data: Buffer | string) => {
            const errorOutput = data.toString();
            lastError = errorOutput; // Keep track of the last thing seen on stderr for error reporting
            log.error(errorOutput); // Log all stderr output
        };

        kuboProcess.stderr.on("data", onStderrData);
        // kuboProcess.stdin.on("data", (data) => log.trace(data.toString())); // Listening on child's stdin is unusual, usually for writing.
        kuboProcess.stdout.on("data", onDaemonReadyOutput);
        kuboProcess.on("error", onProcessError); // For spawn errors or other direct errors from the process object itself
        kuboProcess.on("exit", onProcessExit); // For when the process terminates
    });
}
