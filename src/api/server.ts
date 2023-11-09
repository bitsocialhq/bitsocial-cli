import { PlebbitWsServer } from "@plebbit/plebbit-js/rpc";
import assert from "assert";
import { seedSubplebbits } from "../seeder.js";
import Logger from "@plebbit/plebbit-logger";
import path from "path";

export async function startRpcServer(
    plebbitRpcApiPort: number,
    ipfsApiEndpoint: string,
    ipfsPubsubApiEndpoint: string,
    plebbitDataPath: string,
    seedSubs: string[] | undefined
) {
    const log = Logger("plebbit-cli:rpcServer");

    // Run plebbit RPC server here

    const rpcServer = await PlebbitWsServer({
        port: plebbitRpcApiPort,
        plebbitOptions: {
            ipfsHttpClientsOptions: [ipfsApiEndpoint],
            pubsubHttpClientsOptions: [ipfsPubsubApiEndpoint],
            dataPath: plebbitDataPath
        }
    });

    const handleExit = async (signal: NodeJS.Signals) => {
        log(`in handle exit (${signal})`);
        const subAddresses = await rpcServer.plebbit.listSubplebbits();
        const subs = await Promise.all(subAddresses.map((subAddress) => rpcServer.plebbit.createSubplebbit({ address: subAddress })));

        await Promise.all(subs.map((sub) => sub.stop())); // Stop all running subs
        process.exit();
    };

    ["SIGINT", "SIGTERM", "SIGHUP", "beforeExit"].forEach((exitSignal) => process.on(exitSignal, handleExit));

    console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
    const gateway = Object.keys(rpcServer.plebbit.clients.ipfsGateways)[0];
    assert(typeof gateway === "string");
    console.log(`IPFS Gateway listening on: ${gateway.replace("127.0.0.1", "localhost")}`);
    console.log(`Plebbit API listening on: ws://localhost:${plebbitRpcApiPort}`);
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
