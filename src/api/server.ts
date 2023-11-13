import { PlebbitWsServer } from "@plebbit/plebbit-js/rpc";
import assert from "assert";
import { seedSubplebbits } from "../seeder.js";
import Logger from "@plebbit/plebbit-logger";
import path from "path";

export async function startRpcServer(
    plebbitRpcApiPort: number,
    ipfsApiEndpoint: string,
    ipfsGatewayEndpoint: string,
    plebbitDataPath: string,
    seedSubs: string[] | undefined
) {
    const log = Logger("plebbit-cli:rpcServer");

    // Run plebbit RPC server here

    const rpcServer = await PlebbitWsServer({
        port: plebbitRpcApiPort,
        plebbitOptions: {
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            dataPath: plebbitDataPath
        }
    });

    const handleExit = async (signal: NodeJS.Signals) => {
        log(`in handle exit (${signal})`);
        await rpcServer.destroy();
        process.exit();
    };

    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handleExit));

    console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
    console.log(`IPFS Gateway listening on: ${ipfsGatewayEndpoint}`);
    console.log(`Plebbit RPC API listening on: ws://localhost:${plebbitRpcApiPort}`);
    console.log(`Plebbit data path: ${path.resolve(<string>rpcServer.plebbit.dataPath)}`);
    if (Array.isArray(seedSubs)) {
        const seedSubsLoop = () => {
            // I think calling setTimeout constantly here will overflow memory. Need to check later
            seedSubplebbits(seedSubs, rpcServer.plebbit).then(() => setTimeout(seedSubsLoop, 600000)); // Seed subs every 10 minutes
        };
        console.log(`Seeding subplebbits:`, seedSubs);
        seedSubsLoop();
    }
}
