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

const makeRequestToKuboRpc = async (apiPort: number | string) => {
    return fetch(`http://localhost:${apiPort}/api/v0/bitswap/stat`, { method: "POST" });
};

const testConnectionToPlebbitRpc = async (rpcServerPort: number | string) => {
    const rpcClient = new WebSocket(`ws://localhost:${rpcServerPort}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(rpcClient.readyState).to.equal(1); // 1 = connected
};

const startPlebbitDaemon = (args: string[]): Promise<ChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const daemonProcess = spawn("node", ["./bin/run", "daemon", ...args], { stdio: ["pipe", "pipe", "inherit"] });

        daemonProcess.on("exit", (exitCode, signal) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
        });
        daemonProcess.stdout.on("data", (data) => {
            if (data.toString().match("Subplebbits in data path")) {
                daemonProcess.removeAllListeners();
                resolve(daemonProcess);
            }
        });
        daemonProcess.on("error", (data) => reject(data));
    });
};

const startKuboDaemon = (args: string[]): Promise<ChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const daemonProcess = spawn(kuboExePathFunc(), ["daemon", ...args], { stdio: ["pipe", "pipe", "inherit"] });

        daemonProcess.on("exit", (exitCode, signal) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
        });
        daemonProcess.stdout.on("data", (data) => {
            console.log(`kubo daemon log`, String(data));
            if (data.toString().match("Daemon is ready")) {
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
    let daemonProcess: ChildProcess;

    before(async () => {
        daemonProcess = await startPlebbitDaemon(["--plebbitOptions.dataPath", randomDirectory()]);
        expect(daemonProcess.pid).to.be.a("number");
        expect(daemonProcess.killed).to.be.false;
    });

    after(async () => {
        daemonProcess.kill();
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

        // Test whether rpc server is reachable, it should not be reachable
        const rpcClient = new WebSocket(rpcServerEndPoint);
        rpcClient.onerror = function (errorEvent) {
            console.log("WebSocket Error " + errorEvent);
        };
        await new Promise((resolve) => setTimeout(resolve, 1000));

        assert.throws(rpcClient.ping);
        rpcClient.close();

        // check if kubo is reachable too
        //@ts-ignore
        await assert.isRejected(fetch(`${defaults.KUBO_RPC_URL}/bitswap/stat`, { method: "POST" })); // kubo node should be down
    });
});

describe(`plebbit daemon (kubo daemon is started by another process on the same port that plebbit-cli is using)`, async () => {
    let kuboDaemonProcess: ChildProcess;
    const kuboRpcUrl = new URL(`http://127.0.0.1:5001/api/v0`); // we're using the default here
    before(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait until the previous daemon is killed
        kuboDaemonProcess = await startKuboDaemon(["--init"]); // will start a daemon at 5001
        const res = await makeRequestToKuboRpc(kuboRpcUrl.port);
        expect(res.status).to.equal(200);
    });

    after(async () => {
        if (!kuboDaemonProcess.killed) kuboDaemonProcess.kill();
    });

    it(`plebbit daemon can use a kubo node started by another program`, async () => {
        const plebbitDaemonProcess = await startPlebbitDaemon([
            "--plebbitOptions.dataPath",
            randomDirectory(),
            "--plebbitOptions.kuboRpcClientsOptions[0]",
            kuboRpcUrl.toString()
        ]);
        const rpcClient = new WebSocket(rpcServerEndPoint);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(rpcClient.readyState).to.equal(1); // 1 = connected
        rpcClient.close();
        plebbitDaemonProcess.kill();
    });

    it(`plebbit daemon monitors Kubo RPC started by another process, and start a new Kubo process if needed`, async () => {
        const plebbitDaemonProcess = await startPlebbitDaemon([
            "--plebbitOptions.dataPath",
            randomDirectory(),
            "--plebbitOptions.kuboRpcClientsOptions[0]",
            kuboRpcUrl.toString()
        ]); // should use kuboDaemonProcess
        const rpcClient = new WebSocket(rpcServerEndPoint);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        expect(rpcClient.readyState).to.equal(1); // 1 = connected

        kuboDaemonProcess.kill();
        await new Promise((resolve) => setTimeout(resolve, 15000)); // plebbit daemon should start a new kubo daemon within 10 seconds ish
        const resAfterRestart = await makeRequestToKuboRpc(kuboRpcUrl.port);
        expect(resAfterRestart.status).to.equal(200);

        await plebbitDaemonProcess.kill();
    });
});

describe(`plebbit daemon (relying on plebbit RPC started by another process)`, async () => {
    let rpcProcess: ChildProcess;
    before(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait until the previous daemon is killed
        rpcProcess = await startPlebbitDaemon(["--plebbitOptions.dataPath", randomDirectory()]); // will start a daemon at 5001
        await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
    });

    after(async () => {
        if (!rpcProcess.killed) await rpcProcess.kill();
    });

    it(`plebbit daemon detects and uses another process' plebbit RPC`, async () => {
        const anotherRpcProcess = await startPlebbitDaemon([]); // should start with no problem and use rpcProcess
        await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
        await anotherRpcProcess.kill(); // should not affect rpcProcess
        await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
    });
    it(`plebbit daemon is monitoring another process' plebbit RPC and make sure it's always up`, async () => {
        const anotherRpcProcess = await startPlebbitDaemon(["--plebbitOptions.dataPath", randomDirectory()]); // should monitor rpcProcess
        rpcProcess.kill();
        await new Promise((resolve) => setTimeout(resolve, 6000)); // wait until anotherRpcProcess restart the rpc
        await testConnectionToPlebbitRpc(defaults.PLEBBIT_RPC_URL.port);
        await anotherRpcProcess.kill();
    });
});

describe(`plebbit daemon --plebbitRpcUrl`, async () => {
    it(`A plebbit daemon should be change where to listen URL`, async () => {
        const rpcUrl = new URL("ws://localhost:11138");
        const firstRpcProcess = await startPlebbitDaemon(["--plebbitRpcUrl", rpcUrl.toString()]); // will start a daemon at 9138
        await testConnectionToPlebbitRpc(rpcUrl.port);
        await firstRpcProcess.kill();
    });
});

// TODO add tests for webui
