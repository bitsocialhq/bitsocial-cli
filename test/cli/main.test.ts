// This file is to test root commands like `plebbit daemon` or `plebbit get`, whereas commands like `plebbit subplebbit start` are considered nested
import Plebbit from "@plebbit/plebbit-js";
import { expect } from "chai";
import { spawn } from "child_process";
import defaults from "../../src/cli/defaults.js";
import fetch from "node-fetch";
import { SubplebbitList } from "../../src/types.js";

describe("plebbit daemon", async () => {
    const startDaemon = (args: string[]) => {
        return new Promise(async (resolve, reject) => {
            const spawedProcess = spawn("node", [".", "daemon", ...args]);
            spawedProcess.on("exit", (exitCode, signal) => {
                reject(`spawnAsync process '${spawedProcess.pid}' exited with code '${exitCode}' signal '${signal}'`);
            });
            spawedProcess.stdout.on("data", (data) => {
                if (data.toString().match("You can find API documentation")) resolve(null);
            });
            spawedProcess.on("error", (data) => reject(data));
        });
    };
    it(`Starts a daemon successfully with default args`, async () => {
        await startDaemon([]);
        const plebbit = await Plebbit({ ipfsHttpClientOptions: `http://localhost:${defaults.IPFS_API_PORT}` });
        expect(plebbit.ipfsGatewayUrl).to.equal(`http://127.0.0.1:${defaults.IPFS_GATEWAY_PORT}`);
        // We're able to retrieve ipfs gateway url from ipfs node, that means ipfs node was ran correctly
        const res = await fetch(`http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0/subplebbit/list`, {
            method: "POST"
        });
        const subs: SubplebbitList = <SubplebbitList>await res.json();
        expect(Array.isArray(subs)).to.be.true;
    });
});
