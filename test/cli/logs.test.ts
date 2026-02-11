import { ChildProcess, spawn } from "child_process";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { directory as randomDirectory } from "tempy";
import fsPromise from "fs/promises";
import path from "path";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

type ManagedChildProcess = ChildProcess & { capturedStdout?: string };

const startPlebbitDaemon = (args: string[], env?: Record<string, string>): Promise<ManagedChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const hasCustomDataPath = args.some((arg) => arg.startsWith("--plebbitOptions.dataPath"));
        const hasCustomLogPath = args.some((arg) => arg === "--logPath");
        const logPathArgs = hasCustomLogPath ? [] : ["--logPath", randomDirectory()];
        const daemonArgs = hasCustomDataPath ? args : ["--plebbitOptions.dataPath", randomDirectory(), ...args];
        const daemonProcess = spawn("node", ["./bin/run", "daemon", ...logPathArgs, ...daemonArgs], {
            stdio: ["pipe", "pipe", "inherit"],
            env: env ? { ...process.env, ...env } : undefined
        }) as ManagedChildProcess;

        daemonProcess.capturedStdout = "";
        const onExit = (exitCode: number | null, signal: NodeJS.Signals | null) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
        };
        const onError = (error: Error) => {
            daemonProcess.stdout!.off("data", onStdoutData);
            daemonProcess.off("exit", onExit);
            daemonProcess.off("error", onError);
            reject(error);
        };
        const onStdoutData = (data: Buffer) => {
            const output = data.toString();
            daemonProcess.capturedStdout += output;
            if (output.match("Communities in data path")) {
                daemonProcess.stdout!.off("data", onStdoutData);
                daemonProcess.off("exit", onExit);
                daemonProcess.off("error", onError);
                resolve(daemonProcess);
            }
        };

        daemonProcess.on("exit", onExit);
        daemonProcess.stdout!.on("data", onStdoutData);
        daemonProcess.on("error", onError);
    });
};

const killChildProcess = async (proc?: ChildProcess) => {
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

const stopPlebbitDaemon = async (proc?: ManagedChildProcess) => {
    if (!proc) return;
    await killChildProcess(proc);
};

const ensureKuboNodeStopped = async () => {
    const defaults = (await import("../../dist/common-utils/defaults.js")).default;
    try {
        await fetch(`${defaults.KUBO_RPC_URL}/shutdown`, { method: "POST" });
    } catch {
        /* ignore */
    }
    const deadline = Date.now() + 20000;
    while (Date.now() <= deadline) {
        try {
            const res = await fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" });
            if (!res.ok) break;
        } catch {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
};

// env-paths computes log path as $XDG_STATE_HOME/bitsocial
// So we create stateHome and use stateHome/bitsocial as the logDir
const createLogDirWithStateHome = async () => {
    const stateHome = randomDirectory();
    const logDir = path.join(stateHome, "bitsocial");
    await fsPromise.mkdir(logDir, { recursive: true });
    return { stateHome, logDir };
};

const runBitsocialLogs = (args: string[], stateHome: string): Promise<{ stdout: string; stderr: string; exitCode: number | null }> => {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["./bin/run", "logs", ...args], {
            stdio: ["pipe", "pipe", "pipe"],
            env: { ...process.env, XDG_STATE_HOME: stateHome }
        });

        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (data: Buffer) => {
            stdout += data.toString();
        });
        proc.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
        });
        const timer = setTimeout(() => {
            proc.kill("SIGKILL");
            reject(new Error("bitsocial logs timed out"));
        }, 10000);
        proc.on("close", (exitCode) => {
            clearTimeout(timer);
            resolve({ stdout, stderr, exitCode });
        });
    });
};

// Helper to build synthetic log content with ISO timestamps
const buildLogLine = (date: Date, message: string) => `[${date.toISOString()}] ${message}`;

describe("bitsocial logs (synthetic log file tests)", () => {
    let stateHome: string;
    let logDir: string;
    let logFile: string;

    beforeAll(async () => {
        ({ stateHome, logDir } = await createLogDirWithStateHome());
        logFile = path.join(logDir, "bitsocial_cli_daemon_2026-01-01T00-00-00.000Z.log");
    });

    it("--tail N shows exactly last N entries", async () => {
        const lines = [];
        for (let i = 0; i < 10; i++) {
            const ts = new Date("2026-01-01T00:00:00.000Z");
            ts.setMinutes(i);
            lines.push(buildLogLine(ts, `entry ${i}`));
        }
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["-n", "3"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("entry 7");
        expect(result.stdout).toContain("entry 8");
        expect(result.stdout).toContain("entry 9");
        expect(result.stdout).not.toContain("entry 6");
    });

    it("--tail 0 produces empty output", async () => {
        const lines = [];
        for (let i = 0; i < 5; i++) {
            const ts = new Date("2026-01-01T00:00:00.000Z");
            ts.setMinutes(i);
            lines.push(buildLogLine(ts, `entry ${i}`));
        }
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["-n", "0"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe("");
    });

    it("--since with absolute timestamp filters correctly", async () => {
        const lines = [
            buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "old entry"),
            buildLogLine(new Date("2026-01-01T01:00:00.000Z"), "mid entry"),
            buildLogLine(new Date("2026-01-01T02:00:00.000Z"), "new entry")
        ];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["--since", "2026-01-01T00:30:00.000Z"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain("old entry");
        expect(result.stdout).toContain("mid entry");
        expect(result.stdout).toContain("new entry");
    });

    it("--until filters correctly", async () => {
        const lines = [
            buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "old entry"),
            buildLogLine(new Date("2026-01-01T01:00:00.000Z"), "mid entry"),
            buildLogLine(new Date("2026-01-01T02:00:00.000Z"), "new entry")
        ];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["--until", "2026-01-01T01:30:00.000Z"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("old entry");
        expect(result.stdout).toContain("mid entry");
        expect(result.stdout).not.toContain("new entry");
    });

    it("--since + --tail applies since first then tail", async () => {
        const lines = [
            buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "before cutoff"),
            buildLogLine(new Date("2026-01-01T01:00:00.000Z"), "after cutoff 1"),
            buildLogLine(new Date("2026-01-01T02:00:00.000Z"), "after cutoff 2"),
            buildLogLine(new Date("2026-01-01T03:00:00.000Z"), "after cutoff 3")
        ];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["--since", "2026-01-01T00:30:00.000Z", "-n", "2"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain("before cutoff");
        expect(result.stdout).not.toContain("after cutoff 1");
        expect(result.stdout).toContain("after cutoff 2");
        expect(result.stdout).toContain("after cutoff 3");
    });

    it("--since with relative time filters correctly", async () => {
        const now = new Date();
        const oldDate = new Date(now.getTime() - 3600000); // 1 hour ago
        const recentDate = new Date(now.getTime() - 60000); // 1 minute ago

        const lines = [buildLogLine(oldDate, "old entry"), buildLogLine(recentDate, "recent entry")];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["--since", "5m"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain("old entry");
        expect(result.stdout).toContain("recent entry");
    });

    it("multi-line entries are kept together", async () => {
        const content = [
            `[2026-01-01T00:00:00.000Z] bitsocial-cli:daemon flags:  {`,
            `  plebbitRpcUrl: URL { }`,
            `} +0ms`,
            `[2026-01-01T01:00:00.000Z] second entry`
        ].join("\n");
        await fsPromise.writeFile(logFile, content + "\n");

        const result = await runBitsocialLogs(["-n", "1"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("second entry");
        expect(result.stdout).not.toContain("flags");
    });

    it("multi-line entries include continuation lines", async () => {
        const content = [
            `[2026-01-01T00:00:00.000Z] bitsocial-cli:daemon flags:  {`,
            `  plebbitRpcUrl: URL { }`,
            `} +0ms`,
            `[2026-01-01T01:00:00.000Z] second entry`
        ].join("\n");
        await fsPromise.writeFile(logFile, content + "\n");

        const result = await runBitsocialLogs(["-n", "2"], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("flags");
        expect(result.stdout).toContain("plebbitRpcUrl");
        expect(result.stdout).toContain("} +0ms");
        expect(result.stdout).toContain("second entry");
    });

    it("invalid --tail value produces error", async () => {
        const lines = [buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "entry")];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["-n", "abc"], stateHome);
        expect(result.exitCode).not.toBe(0);
    });

    it("invalid --since value produces error", async () => {
        const lines = [buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "entry")];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["--since", "not-a-date"], stateHome);
        expect(result.exitCode).not.toBe(0);
    });

    it("bitsocial logs errors when no log files exist", async () => {
        const { stateHome: emptyStateHome } = await createLogDirWithStateHome();
        const result = await runBitsocialLogs([], emptyStateHome);
        expect(result.exitCode).not.toBe(0);
    });
});

describe("bitsocial logs (live daemon tests)", async () => {
    let daemonProcess: ManagedChildProcess;
    let stateHome: string;
    let logDir: string;

    beforeAll(async () => {
        await ensureKuboNodeStopped();
        ({ stateHome, logDir } = await createLogDirWithStateHome());
        daemonProcess = await startPlebbitDaemon(["--logPath", logDir]);
        // Give the daemon a moment to write some debug logs
        await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    afterAll(async () => {
        await stopPlebbitDaemon(daemonProcess);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it("daemon writes debug output to log file even when DEBUG is not set", async () => {
        const files = (await fsPromise.readdir(logDir)).filter(
            (f) => f.startsWith("bitsocial_cli_daemon_") && f.endsWith(".log")
        );
        expect(files.length).toBeGreaterThan(0);

        const logContent = await fsPromise.readFile(path.join(logDir, files.sort().pop()!), "utf-8");
        // The log file should contain debug output from bitsocial or plebbit namespaces
        expect(logContent.length).toBeGreaterThan(0);
        expect(logContent).toMatch(/bitsocial|plebbit/i);
    });

    it("log file contains ISO timestamp prefixes", async () => {
        const files = (await fsPromise.readdir(logDir)).filter(
            (f) => f.startsWith("bitsocial_cli_daemon_") && f.endsWith(".log")
        );
        const logContent = await fsPromise.readFile(path.join(logDir, files.sort().pop()!), "utf-8");
        // At least some lines should have the [ISO_TIMESTAMP] prefix
        expect(logContent).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] /m);
    });

    it("log file preserves ANSI color codes", async () => {
        const files = (await fsPromise.readdir(logDir)).filter(
            (f) => f.startsWith("bitsocial_cli_daemon_") && f.endsWith(".log")
        );
        const logContent = await fsPromise.readFile(path.join(logDir, files.sort().pop()!), "utf-8");
        // The log file should contain ANSI escape codes (colors not stripped)
        expect(logContent).toMatch(/\u001b\[/);
    });

    it("bitsocial logs dumps log file content and exits", async () => {
        const result = await runBitsocialLogs([], stateHome);
        expect(result.exitCode).toBe(0);
        expect(result.stdout.length).toBeGreaterThan(0);
        expect(result.stdout).toMatch(/bitsocial|plebbit/i);
    });

    it("bitsocial logs --tail N limits output", async () => {
        const resultAll = await runBitsocialLogs([], stateHome);
        const resultTail = await runBitsocialLogs(["-n", "2"], stateHome);

        expect(resultAll.exitCode).toBe(0);
        expect(resultTail.exitCode).toBe(0);
        // Tail output should be shorter than full output (assuming more than 2 entries)
        expect(resultTail.stdout.length).toBeLessThan(resultAll.stdout.length);
    });

    it("bitsocial logs --since filters recent entries", async () => {
        const result = await runBitsocialLogs(["--since", "5m"], stateHome);
        expect(result.exitCode).toBe(0);
        // Should have some recent output since daemon is running
        expect(result.stdout.length).toBeGreaterThan(0);
    });

    it("bitsocial logs -f streams new log data", async () => {
        const result = await new Promise<{ stdout: string }>((resolve, reject) => {
            const proc = spawn("node", ["./bin/run", "logs", "-f"], {
                stdio: ["pipe", "pipe", "pipe"],
                env: { ...process.env, XDG_STATE_HOME: stateHome }
            });

            let stdout = "";
            proc.stdout.on("data", (data: Buffer) => {
                stdout += data.toString();
            });

            // Let it stream for a few seconds then kill it
            const timer = setTimeout(() => {
                proc.kill("SIGINT");
            }, 3000);

            proc.on("close", () => {
                clearTimeout(timer);
                resolve({ stdout });
            });
            proc.on("error", (err) => {
                clearTimeout(timer);
                reject(err);
            });
        });

        // Should have received some log content (at least the existing log file content)
        expect(result.stdout.length).toBeGreaterThan(0);
    });

    it("bitsocial logs --tail N -f shows N initial entries then streams", async () => {
        const result = await new Promise<{ stdout: string }>((resolve, reject) => {
            const proc = spawn("node", ["./bin/run", "logs", "-n", "3", "-f"], {
                stdio: ["pipe", "pipe", "pipe"],
                env: { ...process.env, XDG_STATE_HOME: stateHome }
            });

            let stdout = "";
            proc.stdout.on("data", (data: Buffer) => {
                stdout += data.toString();
            });

            const timer = setTimeout(() => {
                proc.kill("SIGINT");
            }, 3000);

            proc.on("close", () => {
                clearTimeout(timer);
                resolve({ stdout });
            });
            proc.on("error", (err) => {
                clearTimeout(timer);
                reject(err);
            });
        });

        expect(result.stdout.length).toBeGreaterThan(0);
    });
});
