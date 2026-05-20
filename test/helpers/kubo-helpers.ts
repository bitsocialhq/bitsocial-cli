import * as fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { path as resolveKuboBinary } from "kubo";
import { mergeCliDefaultsIntoIpfsConfig } from "../../src/ipfs/startIpfs.js";

const execFileAsync = promisify(execFile);

const EPHEMERAL_SWARM_ADDRESSES = [
    "/ip4/0.0.0.0/tcp/0",
    "/ip6/::/tcp/0",
    "/ip4/0.0.0.0/udp/0/quic-v1",
    "/ip4/0.0.0.0/udp/0/quic-v1/webtransport",
    "/ip6/::/udp/0/quic-v1",
    "/ip6/::/udp/0/quic-v1/webtransport"
];

// Pre-init a kubo repo so each parallel test daemon gets its own kernel-assigned
// swarm port instead of fighting over the default 4001. Mirrors what
// startKuboNode does on a fresh config (init + server profile + merge defaults),
// then overrides Swarm to ephemeral addresses. When the bitsocial daemon later
// runs `ipfs init` against this dir it'll bail with "configuration file already
// exists", skip mergeCliDefaultsIntoIpfsConfig, and spawn kubo with our Swarm.
export const preInitKuboWithEphemeralSwarm = async (ipfsDataPath: string, apiUrl: URL, gatewayUrl: URL) => {
    await fs.mkdir(ipfsDataPath, { recursive: true });
    const kuboBinaryPath = await resolveKuboBinary();
    const env = { ...process.env, IPFS_PATH: ipfsDataPath };

    await execFileAsync(kuboBinaryPath, ["init"], { env });
    await execFileAsync(kuboBinaryPath, ["config", "profile", "apply", "server"], { env });

    const configPath = path.join(ipfsDataPath, "config");
    await mergeCliDefaultsIntoIpfsConfig(() => {}, configPath, apiUrl, gatewayUrl);

    const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
    config.Addresses = { ...(config.Addresses ?? {}), Swarm: EPHEMERAL_SWARM_ADDRESSES };
    await fs.writeFile(configPath, JSON.stringify(config, null, 4));
};
