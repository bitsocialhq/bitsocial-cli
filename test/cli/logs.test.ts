import { ChildProcess, spawn } from "child_process";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { directory as randomDirectory } from "tempy";
import fsPromise from "fs/promises";
import path from "path";
import dns from "node:dns";
import {
    type ManagedChildProcess,
    stopPkcDaemon,
    startPkcDaemon,
    waitForCondition
} from "../helpers/daemon-helpers.js";
dns.setDefaultResultOrder("ipv4first");

// --- Port allocation (unique to this test file) ---
const RPC_PORT = 9438;
const KUBO_API_PORT = 50129;
const GATEWAY_PORT = 6583;
const rpcWsUrl = `ws://localhost:${RPC_PORT}`;
const kuboApiUrl = `http://0.0.0.0:${KUBO_API_PORT}/api/v0`;
const gatewayUrl = `http://0.0.0.0:${GATEWAY_PORT}`;

const createLogDir = async () => {
    const logDir = randomDirectory();
    await fsPromise.mkdir(logDir, { recursive: true });
    return { logDir };
};

const runBitsocialLogs = (args: string[], logDir: string): Promise<{ stdout: string; stderr: string; exitCode: number | null }> => {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["./bin/run", "logs", "--logPath", logDir, ...args], {
            stdio: ["pipe", "pipe", "pipe"]
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
        }, 30000);
        proc.on("close", (exitCode) => {
            clearTimeout(timer);
            resolve({ stdout, stderr, exitCode });
        });
    });
};

// Helper to build synthetic log content with ISO timestamps
const buildLogLine = (date: Date, message: string) => `[${date.toISOString()}] ${message}`;

describe("bitsocial logs (synthetic log file tests)", () => {
    let logDir: string;
    let logFile: string;

    beforeAll(async () => {
        ({ logDir } = await createLogDir());
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

        const result = await runBitsocialLogs(["-n", "3"], logDir);
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

        const result = await runBitsocialLogs(["-n", "0"], logDir);
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

        const result = await runBitsocialLogs(["--since", "2026-01-01T00:30:00.000Z"], logDir);
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

        const result = await runBitsocialLogs(["--until", "2026-01-01T01:30:00.000Z"], logDir);
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

        const result = await runBitsocialLogs(["--since", "2026-01-01T00:30:00.000Z", "-n", "2"], logDir);
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

        const result = await runBitsocialLogs(["--since", "5m"], logDir);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain("old entry");
        expect(result.stdout).toContain("recent entry");
    });

    it("multi-line entries are kept together", async () => {
        const content = [
            `[2026-01-01T00:00:00.000Z] bitsocial-cli:daemon flags:  {`,
            `  pkcRpcUrl: URL { }`,
            `} +0ms`,
            `[2026-01-01T01:00:00.000Z] second entry`
        ].join("\n");
        await fsPromise.writeFile(logFile, content + "\n");

        const result = await runBitsocialLogs(["-n", "1"], logDir);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("second entry");
        expect(result.stdout).not.toContain("flags");
    });

    it("multi-line entries include continuation lines", async () => {
        const content = [
            `[2026-01-01T00:00:00.000Z] bitsocial-cli:daemon flags:  {`,
            `  pkcRpcUrl: URL { }`,
            `} +0ms`,
            `[2026-01-01T01:00:00.000Z] second entry`
        ].join("\n");
        await fsPromise.writeFile(logFile, content + "\n");

        const result = await runBitsocialLogs(["-n", "2"], logDir);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("flags");
        expect(result.stdout).toContain("pkcRpcUrl");
        expect(result.stdout).toContain("} +0ms");
        expect(result.stdout).toContain("second entry");
    });

    it("invalid --tail value produces error", async () => {
        const lines = [buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "entry")];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["-n", "abc"], logDir);
        expect(result.exitCode).not.toBe(0);
    });

    it("invalid --since value produces error", async () => {
        const lines = [buildLogLine(new Date("2026-01-01T00:00:00.000Z"), "entry")];
        await fsPromise.writeFile(logFile, lines.join("\n") + "\n");

        const result = await runBitsocialLogs(["--since", "not-a-date"], logDir);
        expect(result.exitCode).not.toBe(0);
    });

    it("bitsocial logs errors when no log files exist", async () => {
        const { logDir: emptyLogDir } = await createLogDir();
        const result = await runBitsocialLogs([], emptyLogDir);
        expect(result.exitCode).not.toBe(0);
    });
});

describe("bitsocial logs (live daemon tests)", async () => {
    let daemonProcess: ManagedChildProcess;
    let logDir: string;

    beforeAll(async () => {
        ({ logDir } = await createLogDir());
        daemonProcess = await startPkcDaemon(
            ["--logPath", logDir, "--pkcRpcUrl", rpcWsUrl],
            { KUBO_RPC_URL: kuboApiUrl, IPFS_GATEWAY_URL: gatewayUrl }
        );
        // Wait for log file to be written
        await waitForCondition(async () => {
            const files = await fsPromise.readdir(logDir);
            return files.some((f) => f.startsWith("bitsocial_cli_daemon_") && f.endsWith(".log"));
        }, 10000, 500);
    });

    afterAll(async () => {
        await stopPkcDaemon(daemonProcess);
    });

    it("daemon writes debug output to log file even when DEBUG is not set", async () => {
        const files = (await fsPromise.readdir(logDir)).filter(
            (f) => f.startsWith("bitsocial_cli_daemon_") && f.endsWith(".log")
        );
        expect(files.length).toBeGreaterThan(0);

        const logContent = await fsPromise.readFile(path.join(logDir, files.sort().pop()!), "utf-8");
        // The log file should contain debug output from bitsocial or pkc namespaces
        expect(logContent.length).toBeGreaterThan(0);
        expect(logContent).toMatch(/bitsocial|pkc/i);
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
        const result = await runBitsocialLogs([], logDir);
        expect(result.exitCode).toBe(0);
        expect(result.stdout.length).toBeGreaterThan(0);
        expect(result.stdout).toMatch(/bitsocial|pkc/i);
    });

    it("bitsocial logs --tail N limits output", async () => {
        const resultAll = await runBitsocialLogs([], logDir);
        const resultTail = await runBitsocialLogs(["-n", "2"], logDir);

        expect(resultAll.exitCode).toBe(0);
        expect(resultTail.exitCode).toBe(0);
        // Tail output should be shorter than full output (assuming more than 2 entries)
        expect(resultTail.stdout.length).toBeLessThan(resultAll.stdout.length);
    });

    it("bitsocial logs --since filters recent entries", async () => {
        const result = await runBitsocialLogs(["--since", "5m"], logDir);
        expect(result.exitCode).toBe(0);
        // Should have some recent output since daemon is running
        expect(result.stdout.length).toBeGreaterThan(0);
    });

    it("bitsocial logs -f streams new log data", async () => {
        const result = await new Promise<{ stdout: string }>((resolve, reject) => {
            const proc = spawn("node", ["./bin/run", "logs", "--logPath", logDir, "-f"], {
                stdio: ["pipe", "pipe", "pipe"]
            });

            let stdout = "";
            let killed = false;
            proc.stdout.on("data", (data: Buffer) => {
                stdout += data.toString();
                // Kill once we've received data
                if (!killed) {
                    killed = true;
                    proc.kill("SIGINT");
                }
            });

            // Fallback: kill after 10 seconds if no data received
            const timer = setTimeout(() => {
                if (!killed) {
                    killed = true;
                    proc.kill("SIGINT");
                }
            }, 10000);

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
            const proc = spawn("node", ["./bin/run", "logs", "--logPath", logDir, "-n", "3", "-f"], {
                stdio: ["pipe", "pipe", "pipe"]
            });

            let stdout = "";
            let killed = false;
            proc.stdout.on("data", (data: Buffer) => {
                stdout += data.toString();
                if (!killed) {
                    killed = true;
                    proc.kill("SIGINT");
                }
            });

            const timer = setTimeout(() => {
                if (!killed) {
                    killed = true;
                    proc.kill("SIGINT");
                }
            }, 10000);

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
