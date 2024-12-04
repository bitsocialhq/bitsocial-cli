// Run plebbit daemon, make sure it's not throwing an error
// Try to connect to plebbit RPC, if it doesn't connect, throw

import { ChildProcess, spawn } from "child_process";

const startPlebbitDaemon = async (args: string[]): Promise<ChildProcess> => {
    const Logger = await import("@plebbit/plebbit-logger");
    const log = Logger.default("plebbit-cli:ci:run-daemon-before-release:startPlebbitDaemon");

    return new Promise(async (resolve, reject) => {
        const daemonProcess = spawn("node", ["./bin/run", "daemon", ...args], { stdio: ["pipe", "pipe", "inherit"] });

        let error = "";
        daemonProcess.on("exit", (exitCode, signal) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}' and error: ${error}`);
        });
        daemonProcess.stdout.on("data", (data) => {
            if (data.toString().match("Subplebbits in data path")) {
                daemonProcess.removeAllListeners();
                resolve(daemonProcess);
            }
        });
        daemonProcess.on("error", (data) => {
            log.error("Error from plebbit daemon:", data);
            error += String(data);
        });
    });
};

(async () => {
    const Plebbit = await import("@plebbit/plebbit-js");

    const plebDaemon = await startPlebbitDaemon([]);

    const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: ["ws://localhost:9138"] });

    const sub = await plebbit.createSubplebbit({});
    if (typeof sub.address !== "string") throw Error("Failed to create a sub via RPC");
    await sub.start();
    await new Promise((resolve) => sub.once("update", resolve));

    const remoteSub = await plebbit.getSubplebbit(sub.address);

    if (!remoteSub.encryption) throw Error("subplebbit.encryption should be defined at this point");

    await sub.stop();
    await plebbit.destroy();
    await plebDaemon.kill();

    console.log("No problem with plebbit-cli on this OS and platform");
})();
