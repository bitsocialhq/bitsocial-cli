// This file is to test root commands like `plebbit daemon` or `plebbit get`, whereas commands like `plebbit subplebbit start` are considered nested
import { ChildProcess, spawn } from "child_process";
import defaults from "../../dist/common-utils/defaults.js";
import chai from "chai";
import { directory as randomDirectory } from "tempy";
import WebSocket from "ws";
import { path as ipfsExePathFunc } from "kubo";

//@ts-ignore
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const { expect, assert } = chai;

const rpcServerEndPoint = `ws://localhost:${defaults.PLEBBIT_RPC_API_PORT}`;

const startPlebbitDaemon = (args: string[]): Promise<ChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const daemonProcess = spawn("node", ["./bin/run", "daemon", ...args], { stdio: ["pipe", "pipe", "inherit"] });

        daemonProcess.on("exit", (exitCode, signal) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
        });
        daemonProcess.stdout.on("data", (data) => {
            if (data.toString().match("Plebbit data path")) {
                daemonProcess.removeAllListeners();
                resolve(daemonProcess);
            }
        });
        daemonProcess.on("error", (data) => reject(data));
    });
};

const startIpfsDaemon = (args: string[]): Promise<ChildProcess> => {
    return new Promise(async (resolve, reject) => {
        const daemonProcess = spawn(ipfsExePathFunc(), ["daemon", ...args], { stdio: ["pipe", "pipe", "inherit"] });

        daemonProcess.on("exit", (exitCode, signal) => {
            reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
        });
        daemonProcess.stdout.on("data", (data) => {
            console.log(`Ipfs daemon log`, String(data));
            if (data.toString().match("Daemon is ready")) {
                daemonProcess.removeAllListeners();
                resolve(daemonProcess);
            }
        });
        daemonProcess.on("error", (data) => {
            console.error(`Failed to start ipfs daemon`, String(data));
            reject(data);
        });
    });
};

describe("plebbit daemon (ipfs daemon is started by plebbit)", async () => {
    let daemonProcess: ChildProcess;

    before(async () => {
        daemonProcess = await startPlebbitDaemon(["--plebbitDataPath", randomDirectory()]);
    });

    after(async () => {
        daemonProcess.kill();
    });

    it(`Starts a daemon successfully with default args`, async () => {
        expect(daemonProcess.pid).to.be.a("number");
        expect(daemonProcess.killed).to.be.false;
        const rpcClient = new WebSocket(rpcServerEndPoint);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(rpcClient.readyState).to.equal(1); // 1 = connected
        rpcClient.close();
    });

    [1, 2].map((tryNumber) =>
        it(`Ipfs Node is restarted after failing for ${tryNumber}st time`, async () => {
            const shutdownRes = await fetch(`http://localhost:${defaults.IPFS_API_PORT}/api/v0/shutdown`, {
                method: "POST"
            });
            expect(shutdownRes.status).to.equal(200);
            //@ts-ignore
            await assert.isRejected(fetch(`http://localhost:${defaults.IPFS_API_PORT}/api/v0/bitswap/stat`, { method: "POST" }));

            // Try to connect to ipfs node every 100ms
            await new Promise((resolve) => {
                const timeOut = setInterval(() => {
                    fetch(`http://localhost:${defaults.IPFS_API_PORT}/api/v0/bitswap/stat`, { method: "POST" })
                        .then(resolve)
                        .then(() => clearInterval(timeOut));
                }, 100);
            });

            // IPFS node should be running right now
            //@ts-ignore
            await assert.isFulfilled(fetch(`http://localhost:${defaults.IPFS_API_PORT}/api/v0/bitswap/stat`, { method: "POST" }));
        })
    );

    it(`Ipfs node is killed after killing plebbit daemon`, async () => {
        expect(daemonProcess.kill()).to.be.true;

        // Test whether rpc server is reachable, it should not be reachable
        const rpcClient = new WebSocket(rpcServerEndPoint);
        rpcClient.onerror = function (errorEvent) {
            console.log("WebSocket Error " + errorEvent);
        };
        await new Promise((resolve) => setTimeout(resolve, 1000));

        assert.throws(rpcClient.ping);
        rpcClient.close();

        // check if ipfs is reachable too
        //@ts-ignore
        await assert.isRejected(fetch(`http://localhost:${defaults.IPFS_API_PORT}/api/v0/bitswap/stat`, { method: "POST" })); // IPFS node should be down
    });
});

describe(`plebbit daemon (ipfs daemon is started by another process on the same port that plebbit-cli is using)`, async () => {
    let ipfsDaemonProcess: ChildProcess;

    before(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // wait until the previous daemon is killed
        ipfsDaemonProcess = await startIpfsDaemon(["--init"]); // will start a daemon at 5001
    });

    after(async () => {
        ipfsDaemonProcess.kill();
    });

    it(`plebbit daemon can use an ipfs node started by another program`, async () => {
        const plebbitDaemonProcess = await startPlebbitDaemon(["--plebbitDataPath", randomDirectory()]);
        const rpcClient = new WebSocket(rpcServerEndPoint);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(rpcClient.readyState).to.equal(1); // 1 = connected
        rpcClient.close();
        plebbitDaemonProcess.kill();
    });
});
