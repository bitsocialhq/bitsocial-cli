// import PlebbitIndex from "@plebbit/plebbit-js";
import Logger from "@plebbit/plebbit-logger";
import { startApi } from "../api/server.js";
import { startIpfsNode } from "../ipfs/startIpfs.js";
import { BasePlebbitOptions, DaemonOptions, SubplebbitList } from "../types.js";
import fetch from "node-fetch";

async function _isDaemonUp(options: BasePlebbitOptions): Promise<boolean> {
    try {
        const url = `${options.plebbitApiUrl}/api/v0/subplebbit/list`;
        await (await fetch(url, { method: "POST" })).json();
        return true;
    } catch (e) {
    return false;
}
}

async function _stopIfDaemonIsDown(options: BasePlebbitOptions) {
    if (!(await _isDaemonUp(options))) {
        console.error(`Daemon is down. Please run 'plebbit daemon' before executing this command`); // TODO move this string to a separate file
        process.exit(1);
    }
}
export async function get(input: string, options: any) {
    const log = Logger("plebbit-cli:actions:get");

    log.trace(`(input: ${input}, options:`, options);

    // await _stopIfDaemonIsDown()

    // Make a request to /api/v0/get and print response here
}

export async function daemon(options: DaemonOptions) {
    await startIpfsNode(parseInt(options.ipfsApiPort), parseInt(options.ipfsGatewayPort), false); // TODO permit user to provide their own api and gateway and also plebbit data path port number
    await startApi(
        parseInt(options.plebbitApiPort),
        `http://localhost:${options.ipfsApiPort}/api/v0`,
        `http://localhost:${options.ipfsApiPort}/api/v0`,
        options.plebbitDataPath
    );
}

    await _stopIfDaemonIsDown(options);
    const url = `${options.plebbitApiUrl}/api/v0/subplebbit/list`;

    const subs: SubplebbitList = <SubplebbitList>await (
        await fetch(url, {
            method: "POST"
        })
    ).json();

    console.table(subs);
}
