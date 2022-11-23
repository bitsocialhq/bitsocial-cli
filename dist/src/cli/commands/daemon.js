import { Flags } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { startApi } from "../../api/server.js";
import defaults from "../../common-utils/defaults.js";
import { startIpfsNode } from "../../ipfs/startIpfs.js";
import { BaseCommand } from "../base-command.js";
export default class Daemon extends BaseCommand {
    async run() {
        const { flags } = await this.parse(Daemon);
        const log = Logger("plebbit-cli:daemon");
        log(`flags: `, flags);
        const { pid: ipfsPid } = await startIpfsNode(flags.ipfsApiPort, flags.ipfsGatewayPort, false);
        process.on("exit", () => process.kill(ipfsPid));
        await startApi(flags.plebbitApiPort, `http://localhost:${flags.ipfsApiPort}/api/v0`, `http://localhost:${flags.ipfsApiPort}/api/v0`, flags.plebbitDataPath);
    }
}
Daemon.description = "Run a network-connected Plebbit node";
Daemon.flags = {
    plebbitDataPath: Flags.directory({
        description: "Path to plebbit data path where subplebbits and ipfs node are stored",
        required: true,
        default: defaults.PLEBBIT_DATA_PATH
    }),
    plebbitApiPort: Flags.integer({
        description: "Specify Plebbit API port to listen on",
        required: true,
        default: defaults.PLEBBIT_API_PORT
    }),
    ipfsApiPort: Flags.integer({
        description: "Specify the API port of the ipfs node to listen on",
        required: true,
        default: defaults.IPFS_API_PORT
    }),
    ipfsGatewayPort: Flags.integer({
        description: "Specify the gateway port of the ipfs node to listen on",
        required: true,
        default: defaults.IPFS_GATEWAY_PORT
    })
};
Daemon.examples = [];
