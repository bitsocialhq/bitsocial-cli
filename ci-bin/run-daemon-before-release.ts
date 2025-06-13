// Run plebbit daemon, make sure it's not throwing an error
// Try to connect to plebbit RPC, if it doesn't connect, throw

import { ChildProcess, spawn } from "child_process";

interface SpawnOptions {
    args: string[];
    isDaemon?: boolean;
    waitForPattern?: string;
}

const spawnPlebbitProcess = async (options: SpawnOptions): Promise<ChildProcess | string> => {
    const Logger = await import("@plebbit/plebbit-logger");
    const log = Logger.default("plebbit-cli:ci:run-daemon-before-release:spawnPlebbitProcess");

    const { args, isDaemon = false, waitForPattern } = options;

    return new Promise((resolve, reject) => {
        const fullArgs = ["./bin/run", ...args];
        console.log(`Spawning plebbit process with args: ${fullArgs.join(" ")}`);
        const process = spawn("node", fullArgs, {
            stdio: isDaemon ? ["pipe", "pipe", "inherit"] : ["pipe", "pipe", "pipe"]
        }) as ChildProcess;

        let stdout = "";
        let stderr = "";
        let error = "";

        if (isDaemon) {
            // Daemon mode: wait for specific pattern and return process
            process.on("exit", (exitCode, signal) => {
                reject(`spawnAsync process '${process.pid}' exited with code '${exitCode}' signal '${signal}' and error: ${error}`);
            });

            process.stdout?.on("data", (data) => {
                const output = data.toString();
                if (waitForPattern && output.match(waitForPattern)) {
                    process.removeAllListeners();
                    resolve(process);
                }
            });

            process.on("error", (data) => {
                log.error("Error from plebbit process:", data);
                error += String(data);
            });
        } else {
            // CLI command mode: wait for completion and return output
            process.stdout?.on("data", (data) => {
                stdout += data.toString();
            });

            process.stderr?.on("data", (data) => {
                stderr += data.toString();
            });

            process.on("exit", (exitCode) => {
                if (exitCode === 0) {
                    resolve(stdout.trim());
                } else {
                    reject(`Command failed with exit code ${exitCode}. stderr: ${stderr}`);
                }
            });

            process.on("error", (error) => {
                reject(`Command failed with error: ${error.message}`);
            });
        }
    });
};

(async () => {
    const Logger = await import("@plebbit/plebbit-logger");
    const log = Logger.default("plebbit-cli:ci:run-daemon-before-release");

    const plebDaemon = (await spawnPlebbitProcess({
        args: ["daemon"],
        isDaemon: true,
        waitForPattern: "Subplebbits in data path"
    })) as ChildProcess;

    // Test CLI commands
    log("Testing CLI commands...");

    let subplebbitAddress: string;

    try {
        // Create subplebbit and capture address
        subplebbitAddress = (await spawnPlebbitProcess({
            args: ["subplebbit", "create", "--description", "test"]
        })) as string;
        log(`Created subplebbit with address: ${subplebbitAddress}`);
    } catch (e) {
        log.error("Error creating subplebbit", e);
        await plebDaemon.kill();
        throw e;
    }

    console.log("subplebbit address", subplebbitAddress);
    try {
        // Edit the subplebbit
        await spawnPlebbitProcess({
            args: ["subplebbit", "edit", subplebbitAddress, "--description", "random description"]
        });
        log(`Successfully edited subplebbit ${subplebbitAddress}`);
    } catch (e) {
        log.error("Error editing subplebbit", e);
        await plebDaemon.kill();
        throw e;
    }

    const Plebbit = await import("@plebbit/plebbit-js");

    const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: ["ws://localhost:9138"] });

    plebbit.on("error", (err) => log.error("Client Plebbit has emitted an error", err));

    const sub = await plebbit.createSubplebbit({ address: subplebbitAddress });

    console.log("sub description", sub.description);
    if (sub.description !== "random description") {
        await plebbit.destroy();
        await plebDaemon.kill();
        throw Error("subplebbit.description should be 'random description' at this point. Instead it's: " + sub.description);
    }

    await sub.stop();
    await plebbit.destroy();
    await plebDaemon.kill();

    console.log("No problem with plebbit-cli on this OS and platform");
})();
