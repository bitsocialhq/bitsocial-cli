import { ChildProcess, spawn } from "child_process";
import net from "net";
import { directory as randomDirectory } from "tempy";
import WebSocket from "ws";
import defaults from "../../dist/common-utils/defaults.js";

export type ManagedChildProcess = ChildProcess & { kuboRpcUrl?: URL; capturedStdout?: string; capturedStderr?: string };

export const killChildProcess = async (proc?: ChildProcess) => {
    if (!proc) return;
    if (proc.exitCode !== null || proc.signalCode !== null) return;
    await new Promise<void>((resolve) => {
        let settled = false;
        const cleanup = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve();
        };
        const timer = setTimeout(() => {
            if (proc.exitCode === null && proc.signalCode === null) proc.kill("SIGKILL");
        }, 5000);
        proc.once("exit", cleanup);
        proc.once("close", cleanup);
        const killed = proc.kill();
        if (!killed && (proc.exitCode !== null || proc.signalCode !== null)) cleanup();
    });
};

export const stopPlebbitDaemon = async (proc?: ManagedChildProcess) => {
    if (!proc) return;
    await killChildProcess(proc);
    const kuboRpcUrl = proc.kuboRpcUrl;
    if (!kuboRpcUrl) return;
    const shutdownUrl = new URL(kuboRpcUrl.toString());
    shutdownUrl.pathname = `${shutdownUrl.pathname.replace(/\/$/, "")}/shutdown`;
    try {
        await fetch(shutdownUrl, { method: "POST" });
    } catch {
        /* ignore */
    }
};

export const waitForCondition = async (predicate: () => Promise<boolean> | boolean, timeoutMs = 20000, intervalMs = 500) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() <= deadline) {
        if (await predicate()) return true;
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return false;
};

export const ensureKuboNodeStopped = async (kuboRpcUrl?: string) => {
    const url = kuboRpcUrl || defaults.KUBO_RPC_URL.toString();
    try {
        await fetch(`${url}/shutdown`, { method: "POST" });
    } catch {
        /* ignore */
    }
    await waitForCondition(async () => {
        try {
            const res = await fetch(`${url}/bitswap/stat`, { method: "POST" });
            return !res.ok;
        } catch {
            return true;
        }
    });
};

export const startPlebbitDaemon = (args: string[], env?: Record<string, string>): Promise<ManagedChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const hasCustomDataPath = args.some((arg) => arg.startsWith("--plebbitOptions.dataPath"));
        const hasCustomLogPath = args.some((arg) => arg === "--logPath");
        const logPathArgs = hasCustomLogPath ? [] : ["--logPath", randomDirectory()];
        const daemonArgs = hasCustomDataPath ? args : ["--plebbitOptions.dataPath", randomDirectory(), ...args];
        const daemonProcess = spawn("node", ["./bin/run", "daemon", ...logPathArgs, ...daemonArgs], {
            stdio: ["pipe", "pipe", "pipe"],
            env: env ? { ...process.env, ...env } : undefined
        }) as ManagedChildProcess;

        daemonProcess.capturedStdout = "";
        daemonProcess.capturedStderr = "";
        const onStderrData = (data: Buffer) => {
            daemonProcess.capturedStderr += data.toString();
        };
        const onExit = (exitCode: number | null, signal: NodeJS.Signals | null) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'\nstdout: ${daemonProcess.capturedStdout}\nstderr: ${daemonProcess.capturedStderr}`);
        };
        const onError = (error: Error) => {
            daemonProcess.stdout!.off("data", onStdoutData);
            daemonProcess.stderr!.off("data", onStderrData);
            daemonProcess.off("exit", onExit);
            daemonProcess.off("error", onError);
            reject(error);
        };
        const onStdoutData = (data: Buffer) => {
            const output = data.toString();
            daemonProcess.capturedStdout += output;
            const kuboConfigMatch = output.match(/kuboRpcClientsOptions:\s*\[\s*'([^']+)'/);
            if (!daemonProcess.kuboRpcUrl && kuboConfigMatch?.[1]) {
                try {
                    daemonProcess.kuboRpcUrl = new URL(kuboConfigMatch[1]);
                } catch {
                    /* ignore parse errors */
                }
            }
            if (output.match("Communities in data path")) {
                daemonProcess.stdout!.off("data", onStdoutData);
                daemonProcess.off("exit", onExit);
                daemonProcess.off("error", onError);
                resolve(daemonProcess);
            }
        };

        daemonProcess.on("exit", onExit);
        daemonProcess.stdout!.on("data", onStdoutData);
        daemonProcess.stderr!.on("data", onStderrData);
        daemonProcess.on("error", onError);
    });
};

export const waitForWebSocketOpen = async (ws: WebSocket, timeoutMs = 10000): Promise<void> => {
    if (ws.readyState === 1) return;
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("WebSocket connect timeout")), timeoutMs);
        ws.once("open", () => {
            clearTimeout(timer);
            resolve();
        });
        ws.once("error", (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
};

export const waitForKuboReady = async (kuboApiUrl: string, timeoutMs = 20000) => {
    return waitForCondition(async () => {
        try {
            const res = await fetch(`${kuboApiUrl}/bitswap/stat`, { method: "POST" });
            return res.ok;
        } catch {
            return false;
        }
    }, timeoutMs);
};

export const waitForPortFree = async (port: number, host = "localhost", timeoutMs = 20000) => {
    return waitForCondition(
        () =>
            new Promise<boolean>((resolve) => {
                const socket = new net.Socket();
                socket.setTimeout(500);
                socket.on("connect", () => {
                    socket.destroy();
                    resolve(false);
                });
                socket.on("error", () => {
                    socket.destroy();
                    resolve(true);
                });
                socket.on("timeout", () => {
                    socket.destroy();
                    resolve(true);
                });
                socket.connect(port, host);
            }),
        timeoutMs
    );
};
