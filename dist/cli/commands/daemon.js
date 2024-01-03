"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
// import { seedSubplebbits } from "../../seeder";
const defaults_js_1 = tslib_1.__importDefault(require("../../common-utils/defaults.js"));
const startIpfs_js_1 = require("../../ipfs/startIpfs.js");
const index_1 = require("@plebbit/plebbit-js/dist/node/rpc/src/index");
const path_1 = tslib_1.__importDefault(require("path"));
const crypto_1 = require("crypto");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const tcp_port_used_1 = tslib_1.__importDefault(require("tcp-port-used"));
class Daemon extends core_1.Command {
    async _generateRpcAuthKeyIfNotExisting(plebbitDataPath) {
        // generate plebbit rpc auth key if doesn't exist
        const plebbitRpcAuthKeyPath = path_1.default.join(plebbitDataPath, "auth-key");
        let plebbitRpcAuthKey;
        try {
            plebbitRpcAuthKey = fs_extra_1.default.readFileSync(plebbitRpcAuthKeyPath, "utf8");
        }
        catch (e) {
            plebbitRpcAuthKey = (0, crypto_1.randomBytes)(32).toString("base64").replace(/[/+=]/g, "").substring(0, 40);
            fs_extra_1.default.ensureFileSync(plebbitRpcAuthKeyPath);
            fs_extra_1.default.writeFileSync(plebbitRpcAuthKeyPath, plebbitRpcAuthKey);
        }
        return plebbitRpcAuthKey;
    }
    async run() {
        const { flags } = await this.parse(Daemon);
        const log = (0, plebbit_logger_1.default)("plebbit-cli:daemon");
        log(`flags: `, flags);
        let mainProcessExited = false;
        let isIpfsNodeAlreadyRunningByAnotherProgram = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess;
        const keepIpfsUp = async () => {
            isIpfsNodeAlreadyRunningByAnotherProgram = await tcp_port_used_1.default.check(flags.ipfsApiPort, "127.0.0.1");
            if (isIpfsNodeAlreadyRunningByAnotherProgram) {
                log(`Ipfs API already running on port (${flags.ipfsApiPort}) by another program. Plebbit-cli will use the running ipfs daemon instead of starting a new one`);
                return;
            }
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
        process.on("exit", () => (mainProcessExited = true) && !isIpfsNodeAlreadyRunningByAnotherProgram && process.kill(ipfsProcess.pid));
        const ipfsApiEndpoint = `http://localhost:${flags.ipfsApiPort}/api/v0`;
        const ipfsGatewayEndpoint = `http://localhost:${flags.ipfsGatewayPort}`;
        const rpcAuthKey = await this._generateRpcAuthKeyIfNotExisting(flags.plebbitDataPath);
        const rpcServer = await (0, index_1.PlebbitWsServer)({
            port: flags.plebbitRpcPort,
            plebbitOptions: {
                ipfsHttpClientsOptions: [ipfsApiEndpoint],
                dataPath: flags.plebbitDataPath
            },
            authKey: rpcAuthKey
        });
        const handleExit = async (signal) => {
            log(`in handle exit (${signal})`);
            await rpcServer.destroy();
            process.exit();
        };
        const subs = await rpcServer.plebbit.listSubplebbits();
        ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handleExit));
        console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
        console.log(`IPFS Gateway listening on: ${ipfsGatewayEndpoint}`);
        console.log(`plebbit rpc: listening on ws://localhost:${flags.plebbitRpcPort} (local connections only)`);
        console.log(`plebbit rpc: listening on ws://localhost:${flags.plebbitRpcPort}/${rpcAuthKey} (secret auth key for remote connections)`);
        console.log(`Plebbit data path: ${path_1.default.resolve(rpcServer.plebbit.dataPath)}`);
        console.log(`Subplebbits in data path: `, subs);
        // if (Array.isArray(subsToSeed)) {
        //     const seedSubsLoop = () => {
        //         // I think calling setTimeout constantly here will overflow memory. Need to check later
        //         seedSubplebbits(<string[]>subsToSeed, rpcServer.plebbit).then(() => setTimeout(seedSubsLoop, 600000)); // Seed subs every 10 minutes
        //     };
        //     console.log(`Seeding subplebbits:`, subsToSeed);
        //     seedSubsLoop();
        // }
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
    plebbitRpcPort: core_1.Flags.integer({
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
    "plebbit daemon",
    "plebbit daemon --plebbitRpcPort 80"
    // "plebbit daemon --seed",
    // "plebbit daemon --seed --seedSubs mysub.eth, myothersub.eth, 12D3KooWEKA6Fhp6qtyttMvNKcNCtqH2N7ZKpPy5rfCeM1otr5qU"
];
exports.default = Daemon;
