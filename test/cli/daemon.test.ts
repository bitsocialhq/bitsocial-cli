// This file is to test root commands like `plebbit daemon` or `plebbit get`, whereas commands like `plebbit subplebbit start` are considered nested
import Plebbit from "@plebbit/plebbit-js";
import { ChildProcess, spawn } from "child_process";
import defaults from "../../dist/src/common-utils/defaults.js";
import fetch from "node-fetch";
import { SubplebbitList } from "../../src/api/types.js";
import { Plebbit as PlebbitClass } from "@plebbit/plebbit-js/dist/node/plebbit.js";
import chai from "chai";
//@ts-ignore
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const { expect, assert } = chai;

describe("plebbit daemon", async () => {
    let plebbit: PlebbitClass;
    let daemonProcess: ChildProcess;

    const startDaemon = (args: string[]): Promise<ChildProcess> => {
        return new Promise(async (resolve, reject) => {
            const daemonProcess = spawn("node", ["./bin/run", "daemon", ...args], { stdio: ["pipe", "pipe", "inherit"] });

            daemonProcess.on("exit", (exitCode, signal) => {
                reject(`spawnAsync process '${daemonProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
            });
            daemonProcess.stdout.on("data", (data) => {
                if (data.toString().match("Plebbit API documentation")) {
                    daemonProcess.removeAllListeners();
                    resolve(daemonProcess);
                }
            });
            daemonProcess.on("error", (data) => reject(data));
        });
    };

    before(async () => {
        daemonProcess = await startDaemon([]);
    });
    it(`Starts a daemon successfully with default args`, async () => {
        expect(daemonProcess.pid).to.be.a("number");
        expect(daemonProcess.killed).to.be.false;
        plebbit = await Plebbit({ ipfsHttpClientOptions: `http://localhost:${defaults.IPFS_API_PORT}` });
        expect(plebbit.ipfsGatewayUrl).to.equal(`http://127.0.0.1:${defaults.IPFS_GATEWAY_PORT}`);
        // We're able to retrieve ipfs gateway url from ipfs node, that means ipfs node was ran correctly
        const res = await fetch(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0/subplebbit/list`, {
            method: "POST"
        });
        const subs: SubplebbitList = <SubplebbitList>await res.json();
        expect(Array.isArray(subs)).to.be.true;
    });

    [1, 2].map((tryNumber) =>
        it(`Ipfs Node is restart after failing for ${tryNumber}st time`, async () => {
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

        // Test whether daemon is reachable, it should not be reachable
        //@ts-ignore
        await assert.isRejected(
            fetch(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0/subplebbit/list`, {
                method: "POST"
            }),
            "ECONNRESET",
            ""
        );

        // Plebbit should fail to retrieve gateway from ipfs node since it's killed. Will default to cloudflare after
        plebbit = await Plebbit({ ipfsHttpClientOptions: `http://localhost:${defaults.IPFS_API_PORT}` });
        expect(plebbit.ipfsGatewayUrl).to.equal(`https://cloudflare-ipfs.com`);
    });
});
