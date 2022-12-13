import { Flags, Command } from "@oclif/core";
import Logger from "@plebbit/plebbit-logger";
import { ChildProcessWithoutNullStreams } from "child_process";
import { startApi } from "../../api/server.js";
import defaults from "../../common-utils/defaults.js";
import { startIpfsNode } from "../../ipfs/startIpfs.js";

export default class Daemon extends Command {
    static override description = "Run a network-connected Plebbit node";

    static override flags = {
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

    static override examples = [];

    async run() {
        const { flags } = await this.parse(Daemon);

        const log = Logger("plebbit-cli:daemon");
        log(`flags: `, flags);

        let mainProcessExited = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess: ChildProcessWithoutNullStreams;
        const keepIpfsUp = async () => {
            ipfsProcess = await startIpfsNode(flags.ipfsApiPort, flags.ipfsGatewayPort, false);
            ipfsProcess.on("exit", async () => {
                // Restart IPFS process because it failed
                this.log(`Ipfs node with pid (${ipfsProcess.pid}) disconnected`);
                if (!mainProcessExited) {
                    await keepIpfsUp();
                    this.log(`Ipfs node restarted with new pid (${ipfsProcess.pid})`);
                }
            });
        };

        await keepIpfsUp();

        process.on("exit", () => (mainProcessExited = true) && process.kill(<number>ipfsProcess.pid));
        await startApi(
            flags.plebbitApiPort,
            `http://localhost:${flags.ipfsApiPort}/api/v0`,
            `http://localhost:${flags.ipfsApiPort}/api/v0`,
            flags.plebbitDataPath
        );
    }
}
