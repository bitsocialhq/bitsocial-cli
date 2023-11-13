"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRpcServer = void 0;
const tslib_1 = require("tslib");
const rpc_1 = require("@plebbit/plebbit-js/rpc");
const seeder_js_1 = require("../seeder.js");
const plebbit_logger_1 = tslib_1.__importDefault(require("@plebbit/plebbit-logger"));
const path_1 = tslib_1.__importDefault(require("path"));
async function startRpcServer(plebbitRpcApiPort, ipfsApiEndpoint, ipfsGatewayEndpoint, plebbitDataPath, seedSubs) {
    const log = (0, plebbit_logger_1.default)("plebbit-cli:rpcServer");
    // Run plebbit RPC server here
    const rpcServer = await (0, rpc_1.PlebbitWsServer)({
        port: plebbitRpcApiPort,
        plebbitOptions: {
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            dataPath: plebbitDataPath
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
    console.log(`Plebbit RPC API listening on: ws://localhost:${plebbitRpcApiPort}`);
    console.log(`Plebbit data path: ${path_1.default.resolve(rpcServer.plebbit.dataPath)}`);
    if (Array.isArray(seedSubs)) {
        const seedSubsLoop = () => {
            // I think calling setTimeout constantly here will overflow memory. Need to check later
            (0, seeder_js_1.seedSubplebbits)(seedSubs, rpcServer.plebbit).then(() => setTimeout(seedSubsLoop, 600000)); // Seed subs every 10 minutes
        };
        console.log(`Seeding subplebbits:`, seedSubs);
        seedSubsLoop();
    }
}
exports.startRpcServer = startRpcServer;
