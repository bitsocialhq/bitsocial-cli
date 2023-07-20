"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const server_js_1 = require("../../api/server.js");
const defaults_js_1 = tslib_1.__importDefault(require("../../common-utils/defaults.js"));
const startIpfs_js_1 = require("../../ipfs/startIpfs.js");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
class Daemon extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Daemon);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:daemon");
        log(`flags: `, flags);
        let mainProcessExited = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess;
        const keepIpfsUp = async () => {
            ipfsProcess = await (0, startIpfs_js_1.startIpfsNode)(flags.ipfsApiPort, flags.ipfsGatewayPort, false);
            log(`Started ipfs process with pid (${ipfsProcess.pid})`);
            ipfsProcess.on("exit", async () => {
                // Restart IPFS process because it failed
                log(`Ipfs node with pid (${ipfsProcess.pid}) exited`);
                if (!mainProcessExited)
                    await keepIpfsUp();
                else
                    ipfsProcess.removeAllListeners();
            });
        };
        let subsToSeed;
        if (flags.seed) {
            if (lodash_1.default.isEmpty(flags.seedSubs)) {
                // load default subs here
                const res = await (0, node_fetch_1.default)("https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/subplebbits.json");
                const subs = await res.json();
                subsToSeed = subs.map((sub) => sub.address);
            }
            else
                subsToSeed = flags.seedSubs;
        }
        log.trace(`subs to seed:`, subsToSeed);
        await keepIpfsUp();
        process.on("exit", () => (mainProcessExited = true) && process.kill(ipfsProcess.pid));
        await (0, server_js_1.startApi)(flags.plebbitApiPort, `http://localhost:${flags.ipfsApiPort}/api/v0`, `http://localhost:${flags.ipfsApiPort}/api/v0`, flags.plebbitDataPath, subsToSeed);
    }
}
Daemon.description = "Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users";
Daemon.flags = {
    plebbitDataPath: core_1.Flags.directory({
        description: "Path to plebbit data path where subplebbits and ipfs node are stored",
        required: true,
        default: defaults_js_1.default.PLEBBIT_DATA_PATH
    }),
    seed: core_1.Flags.boolean({
        description: "Seeding flag. Seeding helps subplebbits distribute their publications and latest updates, as well as receiving new publications",
        required: false,
        default: false
    }),
    seedSubs: core_1.Flags.string({
        description: "Subplebbits to seed. If --seed is used and no subs was provided, it will default to seeding default subs",
        required: false,
        multiple: true,
        default: []
    }),
    plebbitApiPort: core_1.Flags.integer({
        description: "Specify Plebbit API port to listen on",
        required: true,
        default: defaults_js_1.default.PLEBBIT_API_PORT
    }),
    ipfsApiPort: core_1.Flags.integer({
        description: "Specify the API port of the ipfs node to listen on",
        required: true,
        default: defaults_js_1.default.IPFS_API_PORT
    }),
    ipfsGatewayPort: core_1.Flags.integer({
        description: "Specify the gateway port of the ipfs node to listen on",
        required: true,
        default: defaults_js_1.default.IPFS_GATEWAY_PORT
    })
};
Daemon.examples = [
    "plebbit daemon",
    "plebbit daemon --seed",
    "plebbit daemon --seed --seedSubs mysub.eth, myothersub.eth, 12D3KooWEKA6Fhp6qtyttMvNKcNCtqH2N7ZKpPy5rfCeM1otr5qU"
];
exports.default = Daemon;
