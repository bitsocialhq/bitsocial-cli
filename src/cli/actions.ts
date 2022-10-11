// import PlebbitIndex from "@plebbit/plebbit-js";
import Logger from "@plebbit/plebbit-logger";
import { startApi } from "../api/server.js";
import { startIpfsNode } from "../ipfs/startIpfs.js";

async function _isDaemonUp(): Promise<boolean> {
    return false;
}
export async function get(input: string, options: any) {
    const log = Logger("plebbit-cli:actions:get");

    log.trace(`(input: ${input}, options:`, options);

    if (!(await _isDaemonUp())) throw Error("Daemon is needed to execute this command. Run 'plebbit daemon' in another terminal and retry");

    // Make a request to /api/v0/get and print response here
}

export async function daemon(options: { plebbitDataPath: string; plebbitApiPort: string; ipfsApiPort: string; ipfsGatewayPort: string }) {
    console.log(options);
    await startIpfsNode(parseInt(options.ipfsApiPort), parseInt(options.ipfsGatewayPort), false); // TODO permit user to provide their own api and gateway and also plebbit data path port number
    console.log(`Resolved ipfs node startup`);
    await startApi(
        parseInt(options.plebbitApiPort),
        `http://localhost:${options.ipfsApiPort}/api/v0`,
        `http://localhost:${options.ipfsApiPort}/api/v0`,
        options.plebbitDataPath
    );
}
