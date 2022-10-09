// import PlebbitIndex from "@plebbit/plebbit-js";
import Logger from "@plebbit/plebbit-logger";
import envPaths from "env-paths";
import { startApi } from "../api/server.js";
import startIpfsNode from "../ipfs/startIpfs.js";

const [defaultIpfsApiPort, defaultIpfsGatewayPort] = [32429, 32430];

async function _isDaemonUp(): Promise<boolean> {
    return false;
}
export async function get(input: string, options: any) {
    const log = Logger("plebbit-cli:actions:get");

    log.trace(`(input: ${input}, options:`, options);

    if (await _isDaemonUp()) {
        // Make a request to /api/get and print response here
    } else {
        // If cid (subplebbit or comment)
        //  - Call ipfs cat <cid> -> res1
        //  - retrieve ipnsName (ipnsName (comment) or address (subplebbit))
        //  - call (ipfs resolve <ipnsName> | ipfs cat) -> res2
        //  - Merge res1 and res2
        //  - Print result
        // Else if domain (subplebbit)
        //  - instantiate Plebbit with any args (We just need access to Plebbit.resolver) to resolve domain
        //  - retreive ipnsName of sub by calling plebbit.resolver.resolveSubplebbitAddress(input)
        //  - call ipfs resolve <ipnsName> | ipfs cat
        //  - Print result
        // Else throw error
        if (isIPFS.cid(input)) {
            // Assume to be CID
        } else if (input.includes(".")) {
            // const plebbit = await PlebbitIndex(); // TODO permit user to provide their own blockchainProviders
            // if (!plebbit.resolver.isDomain(input)) throw Error(`plebbit does not support resolving subplebbit domain '${input}'`);
            // const subIpnsName = await plebbit.resolver.resolveSubplebbitAddressIfNeeded(input);
        } else throw Error(`plebbit does not support resolving subplebbit domain '${input}'`);
    }
}

export async function daemon() {
    const defaultPlebbitDataPath = envPaths("plebbit", { suffix: "" }).data;
    await startIpfsNode(defaultIpfsApiPort, defaultIpfsGatewayPort); // TODO permit user to provide their own api and gateway and also plebbit data path port number
    await startApi(
        defaultIpfsApiPort,
        `http://localhost:${defaultIpfsApiPort}/api/v0`,
        `http://localhost:${defaultIpfsApiPort}/api/v0`,
        defaultPlebbitDataPath
    );
}
