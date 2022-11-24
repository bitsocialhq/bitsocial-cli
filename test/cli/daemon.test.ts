// This file is to test root commands like `plebbit daemon` or `plebbit get`, whereas commands like `plebbit subplebbit start` are considered nested
import Plebbit from "@plebbit/plebbit-js";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
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
    let daemonProcess: ChildProcessWithoutNullStreams;

    const startDaemon = (args: string[]): Promise<{ process: ChildProcessWithoutNullStreams }> => {
        return new Promise(async (resolve, reject) => {
            const spawedProcess = spawn("node", ["./bin/run", "daemon", ...args], { env: process.env });
            spawedProcess.on("exit", (exitCode, signal) => {
                reject(`spawnAsync process '${spawedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
            });
            spawedProcess.stdout.on("data", (data) => {
                if (data.toString().match("You can find API documentation")) {
                    if (!spawedProcess.pid) throw Error(`process ID is not defined`);
                    spawedProcess.removeAllListeners();
                    resolve({ process: spawedProcess });
                }
            });
            spawedProcess.on("error", (data) => reject(data));
        });
    };

    before(async () => {
        daemonProcess = (await startDaemon([])).process;
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
