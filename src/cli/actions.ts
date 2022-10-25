// import PlebbitIndex from "@plebbit/plebbit-js";
import Logger from "@plebbit/plebbit-logger";
import { startApi } from "../api/server.js";
import { startIpfsNode } from "../ipfs/startIpfs.js";
import {
    BasePlebbitOptions,
    CreateSubplebbitOptions,
    DaemonOptions,
    ListSubplebbitOptions,
    StartSubplebbitOptions,
    SubplebbitList
} from "../types.js";

import fetch from "node-fetch";
import { statusCodes } from "../api/responseStatuses.js";
import prettier from "prettier";

import omit from "lodash/omit.js";

async function _isDaemonUp(options: BasePlebbitOptions): Promise<boolean> {
    try {
        const url = `${options.plebbitApiUrl}/subplebbit/list`;
        await (await fetch(url, { method: "POST" })).json();
        return true;
    } catch (e) {
    return false;
}
}

async function _stopIfDaemonIsDown(options: BasePlebbitOptions) {
    if (!(await _isDaemonUp(options))) {
        console.error(`Daemon is down. Please run 'plebbit daemon' before executing this command`); // TODO move this error string to a separate file
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
    const log = Logger("plebbit-cli:actions:daemon");
    log(`options: `, options);
    const { pid: ipfsPid } = await startIpfsNode(parseInt(options.ipfsApiPort), parseInt(options.ipfsGatewayPort), false);
    process.on("exit", () => process.kill(ipfsPid));
    await startApi(
        parseInt(options.plebbitApiPort),
        `http://localhost:${options.ipfsApiPort}/api/v0`,
        `http://localhost:${options.ipfsApiPort}/api/v0`,
        options.plebbitDataPath
    );
}

export async function subplebbitList(options: ListSubplebbitOptions) {
    const log = Logger("plebbit-cli:actions:subplebbitList");
    log(`Options: `, options);
    await _stopIfDaemonIsDown(options);
    const url = `${options.plebbitApiUrl}/subplebbit/list`;

    const subs: SubplebbitList = <SubplebbitList>await (
        await fetch(url, {
            method: "POST"
        })
    ).json();
    const sortedSubs = [...subs].sort((subA, subB) => {
        if (subA.started && !subB.started) return -1;
        else if (subA.started === subB.started) return subA.address.length - subB.address.length;
        else if (!subA.started && subB.started) return 1;
        else return 0;
    });
    if (options.quiet) sortedSubs.forEach((sub) => console.log(sub.address));
    else {
        console.log(`started\t address`);
        sortedSubs.forEach((sub) => console.log(`${sub.started}\t ${sub.address}`));
    }
}

export async function subplebbitCreate(options: CreateSubplebbitOptions) {
    const log = Logger("plebbit-cli:actions:subplebbitCreate");
    log(`Options: `, options);
    await _stopIfDaemonIsDown(options);

    const createOptions = omit(options, ["plebbitApiUrl", "prettyPrint"]);

    const res = await fetch(`${options.plebbitApiUrl}/subplebbit/create`, {
        body: JSON.stringify(createOptions),
        method: "POST",
        headers: { "content-type": "application/json" }
    });
    if (res.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED) {
        // TODO, status text is not enough to explain error. Include more info
        console.error(res.statusText);
        process.exit(1);
    } else if (options.prettyPrint) console.log(prettier.format(await res.text(), { parser: "json" }));
    else console.log(await res.text());
}
}
