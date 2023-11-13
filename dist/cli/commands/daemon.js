"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const seeder_1 = require("../../seeder");
const defaults_js_1 = tslib_1.__importDefault(require("../../common-utils/defaults.js"));
const startIpfs_js_1 = require("../../ipfs/startIpfs.js");
const index_1 = require("@plebbit/plebbit-js/dist/node/rpc/src/index");
const path_1 = tslib_1.__importDefault(require("path"));
class Daemon extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Daemon);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:daemon");
        log(`flags: `, flags);
        let mainProcessExited = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess;
        const keepIpfsUp = async () => {
            ipfsProcess = await (0, startIpfs_js_1.startIpfsNode)(flags.ipfsApiPort, flags.ipfsGatewayPort);
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
        // if (flags.seed) {
        //     if (lodash.isEmpty(flags.seedSubs)) {
        //         // load default subs here
        //         const res = await fetch("https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/subplebbits.json");
        //         const subs: { title: string; address: string }[] = await res.json();
        //         subsToSeed = subs.map((sub) => sub.address);
        //     } else subsToSeed = flags.seedSubs;
        // }
        log.trace(`subs to seed:`, subsToSeed);
        await keepIpfsUp();
        process.on("exit", () => (mainProcessExited = true) && process.kill(ipfsProcess.pid));
        const ipfsApiEndpoint = `http://localhost:${flags.ipfsApiPort}/api/v0`;
        const ipfsGatewayEndpoint = `http://localhost:${flags.ipfsGatewayPort}`;
        const rpcServer = await (0, index_1.PlebbitWsServer)({
            port: flags.plebbitRpcApiPort,
            plebbitOptions: {
                ipfsHttpClientsOptions: [ipfsApiEndpoint],
                dataPath: flags.plebbitDataPath
            }
        });
        const handleExit = async (signal) => {
            log(`in handle exit (${signal})`);
            await rpcServer.destroy();
            process.exit();
        };
        ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handleExit));
        console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
        console.log(`IPFS Gateway listening on: ${ipfsGatewayEndpoint}`);
        console.log(`Plebbit RPC API listening on: ws://localhost:${flags.plebbitRpcApiPort}`);
        console.log(`Plebbit data path: ${path_1.default.resolve(rpcServer.plebbit.dataPath)}`);
        if (Array.isArray(subsToSeed)) {
            const seedSubsLoop = () => {
                // I think calling setTimeout constantly here will overflow memory. Need to check later
                (0, seeder_1.seedSubplebbits)(subsToSeed, rpcServer.plebbit).then(() => setTimeout(seedSubsLoop, 600000)); // Seed subs every 10 minutes
            };
            console.log(`Seeding subplebbits:`, subsToSeed);
            seedSubsLoop();
        }
    }
}
Daemon.description = "Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users";
Daemon.flags = {
    plebbitDataPath: core_1.Flags.directory({
        description: "Path to plebbit data path where subplebbits and ipfs node are stored",
        required: true,
        default: defaults_js_1.default.PLEBBIT_DATA_PATH
    }),
    // seed: Flags.boolean({
    //     description:
    //         "Seeding flag. Seeding helps subplebbits distribute their publications and latest updates, as well as receiving new publications",
    //     required: false,
    //     default: false
    // }),
    // seedSubs: Flags.string({
    //     description: "Subplebbits to seed. If --seed is used and no subs was provided, it will default to seeding default subs",
    //     required: false,
    //     multiple: true,
    //     default: []
    // }),
    plebbitRpcApiPort: core_1.Flags.integer({
        description: "Specify Plebbit RPC API port to listen on",
        required: true,
        default: defaults_js_1.default.PLEBBIT_RPC_API_PORT
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
    "plebbit daemon"
    // "plebbit daemon --seed",
    // "plebbit daemon --seed --seedSubs mysub.eth, myothersub.eth, 12D3KooWEKA6Fhp6qtyttMvNKcNCtqH2N7ZKpPy5rfCeM1otr5qU"
];
exports.default = Daemon;
