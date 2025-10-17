// This file is to test root commands like `plebbit daemon` or `plebbit get`, whereas commands like `plebbit subplebbit start` are considered nested
import { ChildProcess, spawn } from "child_process";
import defaults from "../../dist/common-utils/defaults.js";
import chai from "chai";
import { directory as randomDirectory } from "tempy";
import WebSocket from "ws";
import { path as kuboExePathFunc } from "kubo";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first"); // to be able to resolve localhost

//@ts-ignore
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const { expect, assert } = chai;

const rpcServerEndPoint = defaults.PLEBBIT_RPC_URL;
type ManagedChildProcess = ChildProcess & { kuboRpcUrl?: URL };

const makeRequestToKuboRpc = async (apiPort: number | string) => {
    return fetch(`http://localhost:${apiPort}/api/v0/bitswap/stat`, { method: "POST" });
};

const testConnectionToPlebbitRpc = async (rpcServerPort: number | string) => {
    const rpcClient = new WebSocket(`ws://localhost:${rpcServerPort}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(rpcClient.readyState).to.equal(1); // 1 = connected
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

const waitForCondition = async (predicate: () => Promise<boolean> | boolean, timeoutMs = 20000, intervalMs = 500) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() <= deadline) {
        if (await predicate()) return true;
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return false;
};

const ensureKuboNodeStopped = async () => {
    try {
        await fetch(`${defaults.KUBO_RPC_URL}/shutdown`, { method: "POST" });
    } catch {
        /* ignore */
    }
    await waitForCondition(async () => {
        try {
            const res = await fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" });
            return !res.ok;
        } catch {
            return true;
        }
    });
};

const startPlebbitDaemon = (args: string[]): Promise<ManagedChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const hasCustomDataPath = args.some((arg) => arg.startsWith("--plebbitOptions.dataPath"));
        const hasCustomLogPath = args.some((arg) => arg === "--logPath");
        const logPathArgs = hasCustomLogPath ? [] : ["--logPath", randomDirectory()];
        const daemonArgs = hasCustomDataPath ? args : ["--plebbitOptions.dataPath", randomDirectory(), ...args];
        const daemonProcess = spawn("node", ["./bin/run", "daemon", ...logPathArgs, ...daemonArgs], {
            stdio: ["pipe", "pipe", "inherit"]
        }) as ManagedChildProcess;

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
            const kuboConfigMatch = output.match(/kuboRpcClientsOptions:\s*\[\s*'([^']+)'/);
            if (!daemonProcess.kuboRpcUrl && kuboConfigMatch?.[1]) {
                try {
                    daemonProcess.kuboRpcUrl = new URL(kuboConfigMatch[1]);
                } catch {
                    /* ignore parse errors */
                }
            }
            if (output.match("Subplebbits in data path")) {
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

const startKuboDaemon = (args: string[]): Promise<ChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const daemonArgs = args.some((arg) => arg === "--migrate" || arg.startsWith("--migrate=")) ? [...args] : [...args, "--migrate"];
        const env = { ...process.env, IPFS_PATH: randomDirectory() };
        const daemonProcess = spawn(kuboExePathFunc(), ["daemon", ...daemonArgs], {
            stdio: ["pipe", "pipe", "inherit"],
            env
        });

        daemonProcess.on("exit", (exitCode, signal) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
        });
        daemonProcess.stdout.on("data", (data) => {
            const output = data.toString();
            console.log(`kubo daemon log`, output);
            if (output.match("Daemon is ready")) {
                daemonProcess.removeAllListeners();
                resolve(daemonProcess);
            }
        });
        daemonProcess.on("error", (data) => {
            console.error(`Failed to start kubo daemon`, String(data));
            reject(data);
        });
    });
};

describe("plebbit daemon (kubo daemon is started by plebbit-cli)", async () => {
    let daemonProcess: ManagedChildProcess;

    before(async () => {
        await ensureKuboNodeStopped();

        daemonProcess = await startPlebbitDaemon(["--plebbitOptions.dataPath", randomDirectory()]);
        expect(daemonProcess.pid).to.be.a("number");
        expect(daemonProcess.killed).to.be.false;
    });

    after(async () => {
        await stopPlebbitDaemon(daemonProcess);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it(`Plebbit RPC server is started with default args`, async () => {
        const rpcClient = new WebSocket(rpcServerEndPoint);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(rpcClient.readyState).to.equal(1); // 1 = connected
        rpcClient.close();
    });

    it(`Kubo API is started with default args`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const res = await fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" });
        expect(res.status).to.equal(200);
    });

    [1, 2].map((tryNumber) =>
        it(`Kubo Node is restarted after failing for ${tryNumber}st time`, async () => {
            const shutdownRes = await fetch(`${defaults.KUBO_RPC_URL}/shutdown`, {
                method: "POST"
            });
            expect(shutdownRes.status).to.equal(200);
            //@ts-ignore
            await assert.isRejected(fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" }));

            // Try to connect to kubo node every 100ms
            await new Promise((resolve) => {
                const timeOut = setInterval(() => {
                    fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" })
                        .then(resolve)
                        .then(() => clearInterval(timeOut));
                }, 100);
            });

            // kubo node should be running right now
            //@ts-ignore
            await assert.isFulfilled(fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" }));
        })
    );

    it(`kubo node is killed after killing plebbit daemon`, async () => {
        expect(daemonProcess.kill()).to.be.true;
        await stopPlebbitDaemon(daemonProcess);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Test whether rpc server is reachable, it should not be reachable
        const rpcClient = new WebSocket(rpcServerEndPoint);
        rpcClient.onerror = function (errorEvent) {
            console.log("WebSocket Error ", errorEvent);
        };
        await new Promise((resolve) => setTimeout(resolve, 1000));

        assert.throws(rpcClient.ping);
        rpcClient.close();

        await ensureKuboNodeStopped();
    });
});

describe(`plebbit daemon (kubo daemon is started by another process on the same port that plebbit-cli is using)`, async () => {
    let kuboDaemonProcess: ChildProcess | undefined;
    const kuboRpcUrl = new URL(`http://127.0.0.1:5001/api/v0`); // we're using the default here
    before(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait until the previous daemon is killed
        kuboDaemonProcess = await startKuboDaemon(["--init"]); // will start a daemon at 5001
        const res = await makeRequestToKuboRpc(kuboRpcUrl.port);
        expect(res.status).to.equal(200);
    });

    after(async () => {
        await killChildProcess(kuboDaemonProcess);
    });

    it(`plebbit daemon can use a kubo node started by another program`, async () => {
        let plebbitDaemonProcess: ManagedChildProcess | undefined;
        try {
            plebbitDaemonProcess = await startPlebbitDaemon([
                "--plebbitOptions.dataPath",
                randomDirectory(),
                "--plebbitOptions.kuboRpcClientsOptions[0]",
                kuboRpcUrl.toString()
            ]);
            const rpcClient = new WebSocket(rpcServerEndPoint);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            expect(rpcClient.readyState).to.equal(1); // 1 = connected
            rpcClient.close();
        } finally {
            await stopPlebbitDaemon(plebbitDaemonProcess);
        }
    });

    it(`plebbit daemon monitors Kubo RPC started by another process, and start a new Kubo process if needed`, async () => {
        let plebbitDaemonProcess: ManagedChildProcess | undefined;
        try {
            plebbitDaemonProcess = await startPlebbitDaemon([
                "--plebbitOptions.dataPath",
                randomDirectory(),
                "--plebbitOptions.kuboRpcClientsOptions[0]",
                kuboRpcUrl.toString()
            ]); // should use kuboDaemonProcess
            const rpcClient = new WebSocket(rpcServerEndPoint);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            expect(rpcClient.readyState).to.equal(1); // 1 = connected

            await killChildProcess(kuboDaemonProcess);
            await new Promise((resolve) => setTimeout(resolve, 15000)); // plebbit daemon should start a new kubo daemon within 10 seconds ish
            const resAfterRestart = await makeRequestToKuboRpc(kuboRpcUrl.port);
            expect(resAfterRestart.status).to.equal(200);
        } finally {
            await stopPlebbitDaemon(plebbitDaemonProcess);
        }
    });
});

describe(`plebbit daemon (relying on plebbit RPC started by another process)`, async () => {
    let rpcProcess: ManagedChildProcess;
    before(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait until the previous daemon is killed
        rpcProcess = await startPlebbitDaemon(["--plebbitOptions.dataPath", randomDirectory()]); // will start a daemon at 5001
        await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
    });

    after(async () => {
        await stopPlebbitDaemon(rpcProcess);
    });

    it(`plebbit daemon detects and uses another process' plebbit RPC`, async () => {
        let anotherRpcProcess: ManagedChildProcess | undefined;
        try {
            anotherRpcProcess = await startPlebbitDaemon([]); // should start with no problem and use rpcProcess
            await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
        } finally {
            await stopPlebbitDaemon(anotherRpcProcess); // should not affect rpcProcess
        }
        await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
    });
    it(`plebbit daemon is monitoring another process' plebbit RPC and make sure it's always up`, async () => {
        let anotherRpcProcess: ManagedChildProcess | undefined;
        try {
            anotherRpcProcess = await startPlebbitDaemon(["--plebbitOptions.dataPath", randomDirectory()]); // should monitor rpcProcess
            await stopPlebbitDaemon(rpcProcess);
            await new Promise((resolve) => setTimeout(resolve, 6000)); // wait until anotherRpcProcess restart the rpc
            await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
        } finally {
            await stopPlebbitDaemon(anotherRpcProcess);
        }
    });
});

describe(`plebbit daemon --plebbitRpcUrl`, async () => {
    it(`A plebbit daemon should be change where to listen URL`, async () => {
        const rpcUrl = new URL("ws://localhost:11138");
        let firstRpcProcess: ManagedChildProcess | undefined;
        try {
            firstRpcProcess = await startPlebbitDaemon(["--plebbitRpcUrl", rpcUrl.toString()]); // will start a daemon at 9138
            await testConnectionToPlebbitRpc(rpcUrl.port);
        } finally {
            await stopPlebbitDaemon(firstRpcProcess);
        }
    });
});

// TODO add tests for webui
