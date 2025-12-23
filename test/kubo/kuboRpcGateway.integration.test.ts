import { expect } from "chai";
import { ChildProcessWithoutNullStreams, execFile } from "child_process";
import { once } from "events";
import * as fs from "fs/promises";
import net from "net";
import path from "path";
import { path as resolveKuboBinary } from "kubo";
import { directory as tempDirectory } from "tempy";
import { setTimeout as delay } from "timers/promises";
import { promisify } from "util";
import { startKuboNode } from "../../src/ipfs/startIpfs.js";

const execFileAsync = promisify(execFile);

const waitForOkResponse = async (requestFactory: () => Promise<Response>, attempts = 30, intervalMs = 500) => {
    let lastError: unknown;
    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            const response = await requestFactory();
            if (response.ok) return response;
            lastError = new Error(`Request failed with status ${response.status}`);
        } catch (error) {
            lastError = error;
        }
        await delay(intervalMs);
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const getAvailablePort = async (): Promise<number> =>
    await new Promise<number>((resolve, reject) => {
        const server = net.createServer();
        server.on("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            if (typeof address === "object" && address) {
                const port = address.port;
                server.close((closeError) => {
                    if (closeError) reject(closeError);
                    else resolve(port);
                });
            } else {
                reject(new Error("Failed to determine ephemeral port"));
            }
        });
    });

const listenOnEphemeralPort = async (
    host: string
): Promise<{ server: net.Server; port: number }> =>
    await new Promise<{ server: net.Server; port: number }>((resolve, reject) => {
        const server = net.createServer();
        server.once("error", reject);
        server.listen(0, host, () => {
            const address = server.address();
            if (typeof address === "object" && address) {
                resolve({ server, port: address.port });
            } else {
                reject(new Error("Failed to determine port for temporary listener"));
            }
        });
    });

describe("startKuboNode port validation", function () {
    this.timeout(90_000);

    const closeServer = async (server: net.Server) =>
        await new Promise<void>((resolve) => {
            if (!server.listening) return resolve();
            server.close(() => resolve());
        });

    const restoreIpfsPath = (previous: string | undefined) => {
        if (previous === undefined) delete process.env.IPFS_PATH;
        else process.env.IPFS_PATH = previous;
    };

    it("rejects when the configured API port is occupied", async () => {
        const { server: apiServer, port: apiPort } = await listenOnEphemeralPort("127.0.0.1");
        const gatewayPort = await getAvailablePort();
        const dataPath = tempDirectory();
        const apiUrl = new URL(`http://127.0.0.1:${apiPort}`);
        const gatewayUrl = new URL(`http://127.0.0.1:${gatewayPort}`);
        const previousIpfsPath = process.env.IPFS_PATH;
        process.env.IPFS_PATH = path.join(dataPath, "ipfs-repo");

        try {
            let caughtError: unknown;
            try {
                await startKuboNode(apiUrl, gatewayUrl, dataPath);
            } catch (error) {
                caughtError = error;
            }
            expect(caughtError).to.be.instanceOf(Error);
            expect((caughtError as Error).message).to.include("IPFS API");
            expect((caughtError as Error).message).to.include("already in use");
        } finally {
            await closeServer(apiServer);
            restoreIpfsPath(previousIpfsPath);
        }
    });

    it("rejects when the configured gateway port is occupied", async () => {
        const { server: gatewayServer, port: gatewayPort } = await listenOnEphemeralPort("127.0.0.1");
        const apiPort = await getAvailablePort();
        const dataPath = tempDirectory();
        const apiUrl = new URL(`http://127.0.0.1:${apiPort}`);
        const gatewayUrl = new URL(`http://127.0.0.1:${gatewayPort}`);
        const previousIpfsPath = process.env.IPFS_PATH;
        process.env.IPFS_PATH = path.join(dataPath, "ipfs-repo");

        try {
            let caughtError: unknown;
            try {
                await startKuboNode(apiUrl, gatewayUrl, dataPath);
            } catch (error) {
                caughtError = error;
            }
            expect(caughtError).to.be.instanceOf(Error);
            expect((caughtError as Error).message).to.include("IPFS Gateway");
            expect((caughtError as Error).message).to.include("already in use");
        } finally {
            await closeServer(gatewayServer);
            restoreIpfsPath(previousIpfsPath);
        }
    });

    it("rejects when a swarm TCP port is occupied", async () => {
        const { server: swarmServer, port: swarmPort } = await listenOnEphemeralPort("127.0.0.1");
        const dataPath = tempDirectory();
        const ipfsDataPath = path.join(dataPath, ".plebbit-cli.ipfs");
        const apiPort = await getAvailablePort();
        const gatewayPort = await getAvailablePort();
        const apiUrl = new URL(`http://127.0.0.1:${apiPort}`);
        const gatewayUrl = new URL(`http://127.0.0.1:${gatewayPort}`);
        const kuboBinaryPath = await resolveKuboBinary();

        await fs.mkdir(ipfsDataPath, { recursive: true });
        await execFileAsync(kuboBinaryPath, ["init"], {
            env: { ...process.env, IPFS_PATH: ipfsDataPath }
        });

        const configPath = path.join(ipfsDataPath, "config");
        const config = JSON.parse(await fs.readFile(configPath, "utf8"));
        config.Addresses = {
            ...(config.Addresses ?? {}),
            API: `/ip4/${apiUrl.hostname}/tcp/${apiUrl.port}`,
            Gateway: `/ip4/${gatewayUrl.hostname}/tcp/${gatewayUrl.port}`,
            Swarm: [`/ip4/127.0.0.1/tcp/${swarmPort}`]
        };
        await fs.writeFile(configPath, JSON.stringify(config, null, 4), "utf8");

        const previousIpfsPath = process.env.IPFS_PATH;
        process.env.IPFS_PATH = ipfsDataPath;

        try {
            let caughtError: unknown;
            try {
                await startKuboNode(apiUrl, gatewayUrl, dataPath);
            } catch (error) {
                caughtError = error;
            }
            expect(caughtError).to.be.instanceOf(Error);
            expect((caughtError as Error).message).to.include("IPFS Swarm");
            expect((caughtError as Error).message).to.include("already in use");
        } finally {
            await closeServer(swarmServer);
            restoreIpfsPath(previousIpfsPath);
        }
    });
});

describe("kubo RPC + gateway integration", function () {
    this.timeout(120_000);

    let kuboProcess: ChildProcessWithoutNullStreams | undefined;
    let apiUrl: URL;
    let gatewayUrl: URL;
    let ipfsRepoPath: string;

    before(async () => {
        const dataPath = tempDirectory();
        ipfsRepoPath = path.join(dataPath, "ipfs-repo");
        process.env.IPFS_PATH = ipfsRepoPath;

        const apiPort = await getAvailablePort();
        const gatewayPort = await getAvailablePort();
        apiUrl = new URL(`http://127.0.0.1:${apiPort}`);
        gatewayUrl = new URL(`http://127.0.0.1:${gatewayPort}`);

        kuboProcess = await startKuboNode(apiUrl, gatewayUrl, dataPath);

        await waitForOkResponse(() => fetch(new URL("/api/v0/version", apiUrl), { method: "POST" }));
    });

    after(async () => {
        if (kuboProcess?.pid) {
            const exitPromise = once(kuboProcess, "exit");
            try {
                if (process.platform !== "win32") process.kill(-kuboProcess.pid, "SIGTERM");
            } catch {
                /* best effort */
            }
            kuboProcess.kill("SIGTERM");
            await Promise.race([exitPromise, delay(10_000)]);
        }
        delete process.env.IPFS_PATH;
    });

    it("supports CLI command execution, RPC API calls, and gateway reads", async function () {
        this.timeout(90_000);

        const kuboBinaryPath = await resolveKuboBinary();
        const fileDirectory = tempDirectory();
        const filePath = path.join(fileDirectory, "hello.txt");
        const fileContents = `plebbit kubo integration ${Date.now()}`;
        await fs.writeFile(filePath, fileContents, "utf8");

        const { stdout } = await execFileAsync(kuboBinaryPath, ["add", "-q", filePath], {
            env: { ...process.env, IPFS_PATH: ipfsRepoPath }
        });
        const cid = stdout.trim();
        expect(cid.length).to.be.greaterThan(0);

        const rpcResponse = await waitForOkResponse(() => fetch(new URL(`/api/v0/cat?arg=${cid}`, apiUrl), { method: "POST" }));
        const rpcBody = await rpcResponse.text();
        expect(rpcBody).to.equal(fileContents);

        const gatewayResponse = await waitForOkResponse(() => fetch(new URL(`/ipfs/${cid}`, gatewayUrl)), 40, 500);
        const gatewayBody = await gatewayResponse.text();
        expect(gatewayBody).to.equal(fileContents);
    });
});
