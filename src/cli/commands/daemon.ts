import { Flags, Command } from "@oclif/core";
import { ChildProcessWithoutNullStreams } from "child_process";

import defaults from "../../common-utils/defaults.js";
import { startIpfsNode } from "../../ipfs/startIpfs.js";
import path from "path";
import tcpPortUsed from "tcp-port-used";
import { getLanIpV4Address, getPlebbitLogger } from "../../util.js";
import { startDaemonServer } from "../../webui/daemon-server.js";
import fs from "fs";
import fsPromise from "fs/promises";
import { EOL } from "node:os";

export default class Daemon extends Command {
    static override description =
        "Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any machine. Within the web ui users are able to browse, create and manage their subs fully P2P";

    static override flags = {
        plebbitDataPath: Flags.directory({
            description: "Path to plebbit data path where subplebbits and ipfs node are stored",
            required: true,
            default: defaults.PLEBBIT_DATA_PATH
        }),

        plebbitRpcPort: Flags.integer({
            description: "Specify Plebbit RPC port to listen on",
            required: true,
            default: defaults.PLEBBIT_RPC_API_PORT
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

    static override examples = ["plebbit daemon", "plebbit daemon --plebbitRpcPort 80"];

    private _setupLogger(Logger: any) {
        const envDebug: string | undefined = process.env["DEBUG"];
        const debugNamespace = envDebug === "0" || envDebug === "" ? undefined : envDebug || "plebbit*, -plebbit*trace";
        if (debugNamespace) {
            console.log("Debug logs is on with namespace", `"${debugNamespace}"`);
            Logger.enable(debugNamespace);
        } else {
            console.log("Debug logs are disabled");
            Logger.disable();
        }
    }

    private async _getNewLogfileByEvacuatingOldLogsIfNeeded() {
        try {
            await fsPromise.mkdir(defaults.PLEBBIT_LOG_PATH, { recursive: true });
        } catch (e) {
            //@ts-expect-error
            if (e.code !== "EEXIST") throw e;
        }
        const logFiles = (await fsPromise.readdir(defaults.PLEBBIT_LOG_PATH, { withFileTypes: true })).filter((file) =>
            file.name.startsWith("plebbit_cli_daemon")
        );
        const logfilesCapacity = 5; // we only store 5 log files
        if (logFiles.length >= logfilesCapacity) {
            // we need to pick the oldest log to delete
            const logFileToDelete = logFiles.map((logFile) => logFile.name).sort()[0]; // TODO need to test this, not sure if it works
            console.log(`Will remove log (${logFileToDelete}) because we reached capacity (${logfilesCapacity})`);
            await fsPromise.rm(path.join(defaults.PLEBBIT_LOG_PATH, logFileToDelete));
        }

        return path.join(defaults.PLEBBIT_LOG_PATH, `plebbit_cli_daemon_${new Date().toISOString()}.log`);
    }

    private async _pipeDebugLogsToLogFile() {
        const logFilePath = await this._getNewLogfileByEvacuatingOldLogsIfNeeded();

        const logFile = fs.createWriteStream(logFilePath, { flags: "a" });
        const stdoutWrite = process.stdout.write.bind(process.stdout);
        const stderrWrite = process.stderr.write.bind(process.stderr);

        const removeColor = (data: string | Uint8Array) => {
            const parsedData = data instanceof Uint8Array ? Buffer.from(data).toString() : data;
            return parsedData.replaceAll(/\u001b\[.*?m/g, "");
        };

        const isLogFileOverLimit = () => logFile.bytesWritten > 20000000; // 20mb

        process.stdout.write = (...args) => {
            //@ts-expect-error
            const res = stdoutWrite(...args);
            if (!isLogFileOverLimit()) logFile.write(removeColor(args[0]) + EOL);
            return res;
        };

        process.stderr.write = (...args) => {
            //@ts-expect-error
            const res = stderrWrite(...args);
            if (!isLogFileOverLimit()) logFile.write(removeColor(args[0]).trimStart() + EOL);
            return res;
        };

        console.log("Will store stderr + stdout log to", logFilePath);

        // errors aren't console logged
        process.on("uncaughtException", console.error);
        process.on("unhandledRejection", console.error);

        process.on("exit", () => logFile.close());
    }

    async run() {
        const { flags } = await this.parse(Daemon);
        const Logger = await getPlebbitLogger();
        this._setupLogger(Logger);
        await this._pipeDebugLogsToLogFile();
        const log = Logger("plebbit-cli:daemon");

        log(`flags: `, flags);

        const ipfsApiEndpoint = `http://localhost:${flags.ipfsApiPort}/api/v0`;
        const ipfsGatewayEndpoint = `http://localhost:${flags.ipfsGatewayPort}`;

        let mainProcessExited = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess: ChildProcessWithoutNullStreams | undefined;
        const keepIpfsUp = async () => {
            if (ipfsProcess || usingDifferentProcessRpc) return; // already started, no need to intervene
            const isIpfsApiPortTaken = await tcpPortUsed.check(flags.ipfsApiPort, "127.0.0.1");
            if (isIpfsApiPortTaken) {
                log(
                    `Ipfs API already running on port (${flags.ipfsApiPort}) by another program. Plebbit-cli will use the running ipfs daemon instead of starting a new one`
                );
                return;
            }
            ipfsProcess = await startIpfsNode(flags.ipfsApiPort, flags.ipfsGatewayPort);
            log(`Started ipfs process with pid (${ipfsProcess.pid})`);
            console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
            console.log(`IPFS Gateway listening on: ${ipfsGatewayEndpoint}`);
            ipfsProcess.on("exit", async () => {
                // Restart IPFS process because it failed
                log(`Ipfs node with pid (${ipfsProcess?.pid}) exited`);
                if (!mainProcessExited) {
                    ipfsProcess = undefined;
                    await keepIpfsUp();
                } else ipfsProcess!.removeAllListeners();
            });
        };

        let startedOwnRpc = false;
        let usingDifferentProcessRpc = false;

        const createOrConnectRpc = async () => {
            if (startedOwnRpc) return;
            const isRpcPortTaken = await tcpPortUsed.check(flags.plebbitRpcPort, "127.0.0.1");
            if (isRpcPortTaken && usingDifferentProcessRpc) return;
            if (isRpcPortTaken) {
                log(
                    `Plebbit RPC is already running on port (${flags.plebbitRpcPort}) by another program. Plebbit-cli will use the running RPC server, and if shuts down, plebbit-cli will start a new RPC instance`
                );
                const plebbitRpcApiUrl = `ws://localhost:${flags.plebbitRpcPort}`;
                console.log("Using the already started RPC server at:", plebbitRpcApiUrl);
                console.log("plebbit-cli daemon will monitor the plebbit RPC and ipfs API to make sure they're always up");
                const Plebbit = await import("@plebbit/plebbit-js");
                const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcApiUrl] });
                await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
                plebbit.on("error", () => {});
                console.log(`Subplebbits in data path: `, plebbit.subplebbits);
                usingDifferentProcessRpc = true;
                return;
            }

            const daemonServer = await startDaemonServer(
                flags.plebbitRpcPort,
                flags.ipfsGatewayPort,
                ipfsApiEndpoint,
                flags.plebbitDataPath
            );

            usingDifferentProcessRpc = false;
            startedOwnRpc = true;
            console.log(`plebbit rpc: listening on ws://localhost:${flags.plebbitRpcPort} (local connections only)`);
            console.log(
                `plebbit rpc: listening on ws://localhost:${flags.plebbitRpcPort}/${daemonServer.rpcAuthKey} (secret auth key for remote connections)`
            );

            console.log(`Plebbit data path: ${path.resolve(flags.plebbitDataPath)}`);
            console.log(`Subplebbits in data path: `, daemonServer.listedSub);

            const localIpAddress = "localhost";
            const remoteIpAddress = getLanIpV4Address() || localIpAddress;
            for (const webui of daemonServer.webuis) {
                console.log(
                    `WebUI (${webui.name}): http://${localIpAddress}:${flags.plebbitRpcPort}${webui.endpointLocal} (local connections only)`
                );
                console.log(
                    `WebUI (${webui.name}): http://${remoteIpAddress}:${flags.plebbitRpcPort}${webui.endpointRemote} (secret auth key for remote connections)`
                );
            }
        };

        await keepIpfsUp();
        await createOrConnectRpc();

        setInterval(async () => {
            await keepIpfsUp();
            await createOrConnectRpc();
        }, 5000);

        process.on("exit", () => {
            mainProcessExited = true;
            if (typeof ipfsProcess?.pid === "number" && !ipfsProcess.killed) process.kill(ipfsProcess.pid);
        });
    }
}
