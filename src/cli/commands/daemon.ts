import { Flags, Command } from "@oclif/core";
import { ChildProcessWithoutNullStreams } from "child_process";

import defaults from "../../common-utils/defaults.js";
import { startKuboNode } from "../../ipfs/startIpfs.js";
import path from "path";
import tcpPortUsed from "tcp-port-used";
import {
    getLanIpV4Address,
    getPlebbitLogger,
    loadKuboConfigFile,
    parseMultiAddrKuboRpcToUrl,
    parseMultiAddrIpfsGatewayToUrl
} from "../../util.js";
import { startDaemonServer } from "../../webui/daemon-server.js";
import fs from "fs";
import fsPromise from "fs/promises";
import { EOL } from "node:os";
//@ts-expect-error
import type { InputPlebbitOptions } from "@plebbit/plebbit-js/dist/node/types.js";
//@ts-expect-error
import DataObjectParser from "dataobject-parser";

import * as remeda from "remeda";

const defaultPlebbitOptions: InputPlebbitOptions = {
    dataPath: defaults.PLEBBIT_DATA_PATH,
    httpRoutersOptions: defaults.HTTP_TRACKERS
};

export default class Daemon extends Command {
    static override description = `Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any machine. Within the web ui users are able to browse, create and manage their subs fully P2P.
    Options can be passed to the RPC's instance through flag --plebbitOptions.optionName. For a list of plebbit options (https://github.com/plebbit/plebbit-js?tab=readme-ov-file#plebbitoptions)
    If you need to modify ipfs config, you should head to {plebbit-data-path}/.ipfs-plebbit-cli/config and modify the config file
    `;

    static override flags = {
        plebbitRpcUrl: Flags.url({
            description: "Specify Plebbit RPC URL to listen on",
            required: true,
            default: defaults.PLEBBIT_RPC_URL
        }),

        logPath: Flags.directory({
            description: "Specify a directory which will be used to store logs",
            required: true,
            default: defaults.PLEBBIT_LOG_PATH
        })
    };

    static override examples = [
        "plebbit daemon",
        "plebbit daemon --plebbitRpcUrl ws://localhost:53812",
        "plebbit daemon --plebbitOptions.dataPath /tmp/plebbit-datapath/",
        "plebbit daemon --plebbitOptions.chainProviders.eth[0].url https://ethrpc.com",
        "plebbit daemon --plebbitOptions.kuboRpcClientsOptions[0] https://remoteipfsnode.com"
    ];

    private _setupLogger(Logger: any) {
        const envDebug: string | undefined = process.env["DEBUG"];
        const debugNamespace = envDebug === "0" || envDebug === "" ? undefined : envDebug || "plebbit*, -plebbit*trace";

        const debugDepth = process.env["DEBUG_DEPTH"] ? parseInt(process.env["DEBUG_DEPTH"]) : 10;
        Logger.inspectOpts = Logger.inspectOpts || {};
        Logger.inspectOpts.depth = debugDepth;

        if (debugNamespace) {
            console.log("Debug logs is on with namespace", `"${debugNamespace}"`);
            console.log("Debug depth is set to", debugDepth);
            Logger.enable(debugNamespace);
        } else {
            console.log("Debug logs are disabled");
            Logger.disable();
        }
    }

    private async _getNewLogfileByEvacuatingOldLogsIfNeeded(logPath: string) {
        try {
            await fsPromise.mkdir(logPath, { recursive: true });
        } catch (e) {
            //@ts-expect-error
            if (e.code !== "EEXIST") throw e;
        }
        const logFiles = (await fsPromise.readdir(logPath, { withFileTypes: true })).filter((file) =>
            file.name.startsWith("plebbit_cli_daemon")
        );
        const logfilesCapacity = 5; // we only store 5 log files
        if (logFiles.length >= logfilesCapacity) {
            // we need to pick the oldest log to delete
            const logFileToDelete = logFiles.map((logFile) => logFile.name).sort()[0]; // TODO need to test this, not sure if it works
            console.log(`Will remove log (${logFileToDelete}) because we reached capacity (${logfilesCapacity})`);
            await fsPromise.rm(path.join(logPath, logFileToDelete));
        }

        return path.join(logPath, `plebbit_cli_daemon_${new Date().toISOString().replace(/:/g, "-")}.log`);
    }

    private async _pipeDebugLogsToLogFile(logPath: string) {
        const logFilePath = await this._getNewLogfileByEvacuatingOldLogsIfNeeded(logPath);

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
        await this._pipeDebugLogsToLogFile(flags.logPath);
        const log = Logger("plebbit-cli:daemon");

        log(`flags: `, flags);

        const plebbitRpcUrl = new URL(flags.plebbitRpcUrl);

        const plebbitOptionsFlagNames = Object.keys(flags).filter((flag) => flag.startsWith("plebbitOptions"));
        const plebbitOptionsFromFlag: InputPlebbitOptions | undefined =
            plebbitOptionsFlagNames.length > 0
                ? DataObjectParser.transpose(remeda.pick(flags, plebbitOptionsFlagNames))["_data"]?.["plebbitOptions"]
                : undefined;

        if (plebbitOptionsFromFlag?.plebbitRpcClientsOptions && plebbitRpcUrl.toString() !== defaults.PLEBBIT_RPC_URL.toString()) {
            this.error(
                "Can't provide plebbitOptions.plebbitRpcClientsOptions and --plebbitRpcUrl simuatelounsly. You have to choose between connecting to an RPC or starting up a new RPC"
            );
        }

        if (plebbitOptionsFromFlag?.kuboRpcClientsOptions && plebbitOptionsFromFlag.kuboRpcClientsOptions.length !== 1)
            this.error("Can't provide plebbitOptions.kuboRpcClientsOptions as an array with more than 1 element, or as a non array");

        if (plebbitOptionsFromFlag?.ipfsGatewayUrls && plebbitOptionsFromFlag.ipfsGatewayUrls.length !== 1)
            this.error("Can't provide plebbitOptions.ipfsGatewayUrls as an array with more than 1 element, or as a non array");

        const ipfsConfig = await loadKuboConfigFile(plebbitOptionsFromFlag?.dataPath || defaultPlebbitOptions.dataPath!);
        const kuboRpcEndpoint = plebbitOptionsFromFlag?.kuboRpcClientsOptions
            ? new URL(plebbitOptionsFromFlag.kuboRpcClientsOptions[0]!.toString())
            : ipfsConfig?.["Addresses"]?.["API"]
            ? await parseMultiAddrKuboRpcToUrl(ipfsConfig?.["Addresses"]?.["API"])
            : defaults.KUBO_RPC_URL;
        const ipfsGatewayEndpoint = plebbitOptionsFromFlag?.ipfsGatewayUrls
            ? new URL(plebbitOptionsFromFlag.ipfsGatewayUrls[0])
            : ipfsConfig?.["Addresses"]?.["Gateway"]
            ? await parseMultiAddrIpfsGatewayToUrl(ipfsConfig?.["Addresses"]?.["Gateway"])
            : defaults.IPFS_GATEWAY_URL;

        defaultPlebbitOptions.kuboRpcClientsOptions = [kuboRpcEndpoint.toString()];
        const mergedPlebbitOptions = { ...defaultPlebbitOptions, ...plebbitOptionsFromFlag };
        log("Merged plebbit options that will be used for this node", mergedPlebbitOptions);

        let mainProcessExited = false;
        // Kubo Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let kuboProcess: ChildProcessWithoutNullStreams | undefined;
        const keepKuboUp = async () => {
            const kuboApiPort = Number(kuboRpcEndpoint.port);
            if (kuboProcess || usingDifferentProcessRpc) return; // already started, no need to intervene
            const isKuboApiPortTaken = await tcpPortUsed.check(kuboApiPort, kuboRpcEndpoint.hostname);
            if (isKuboApiPortTaken) {
                log.trace(
                    `Kubo API already running on port (${kuboApiPort}) by another program. Plebbit-cli will use the running ipfs daemon instead of starting a new one`
                );
                return;
            }
            kuboProcess = await startKuboNode(kuboRpcEndpoint, ipfsGatewayEndpoint, mergedPlebbitOptions.dataPath!);
            log(`Started kubo ipfs process with pid (${kuboProcess.pid})`);
            console.log(`Kubo IPFS API listening on: ${kuboRpcEndpoint}`);
            console.log(`Kubo IPFS Gateway listening on: ${ipfsGatewayEndpoint}`);
            kuboProcess.on("exit", async () => {
                // Restart Kubo process because it failed
                if (!mainProcessExited) {
                    log(`Kubo node with pid (${kuboProcess?.pid}) exited. Will attempt to restart it`);
                    kuboProcess = undefined;
                    await keepKuboUp();
                } else kuboProcess!.removeAllListeners();
            });
        };

        let startedOwnRpc = false;
        let usingDifferentProcessRpc = false;
        let daemonServer: Awaited<ReturnType<typeof startDaemonServer>> | undefined;
        const createOrConnectRpc = async () => {
            if (mainProcessExited) return;
            if (startedOwnRpc) return;
            const isRpcPortTaken = await tcpPortUsed.check(Number(plebbitRpcUrl.port), plebbitRpcUrl.hostname);
            if (isRpcPortTaken && usingDifferentProcessRpc) return;
            if (isRpcPortTaken) {
                log(
                    `Plebbit RPC is already running (${plebbitRpcUrl}) by another program. Plebbit-cli will use the running RPC server, and if shuts down, plebbit-cli will start a new RPC instance`
                );
                console.log("Using the already started RPC server at:", plebbitRpcUrl);
                console.log("plebbit-cli daemon will monitor the plebbit RPC and kubo ipfs API to make sure they're always up");
                const Plebbit = await import("@plebbit/plebbit-js");
                const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcUrl.toString()] });
                await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
                plebbit.on("error", (error) => console.error("Error from plebbit instance", error));
                console.log(`Subplebbits in data path: `, plebbit.subplebbits);
                usingDifferentProcessRpc = true;
                return;
            }

            daemonServer = await startDaemonServer(plebbitRpcUrl, ipfsGatewayEndpoint, mergedPlebbitOptions);

            usingDifferentProcessRpc = false;
            startedOwnRpc = true;
            console.log(`plebbit rpc: listening on ${plebbitRpcUrl} (local connections only)`);
            console.log(`plebbit rpc: listening on ${plebbitRpcUrl}/${daemonServer.rpcAuthKey} (secret auth key for remote connections)`);

            console.log(`Plebbit data path: ${path.resolve(mergedPlebbitOptions.dataPath!)}`);
            console.log(`Subplebbits in data path: `, daemonServer.listedSub);

            const localIpAddress = "localhost";
            const remoteIpAddress = getLanIpV4Address() || localIpAddress;
            const rpcPort = plebbitRpcUrl.port;
            for (const webui of daemonServer.webuis) {
                console.log(`WebUI (${webui.name}): http://${localIpAddress}:${rpcPort}${webui.endpointLocal} (local connections only)`);
                console.log(
                    `WebUI (${webui.name}): http://${remoteIpAddress}:${rpcPort}${webui.endpointRemote} (secret auth key for remote connections)`
                );
            }
        };

        const isRpcPortTaken = await tcpPortUsed.check(Number(plebbitRpcUrl.port), plebbitRpcUrl.hostname);

        if (!plebbitOptionsFromFlag?.kuboRpcClientsOptions && !isRpcPortTaken && !usingDifferentProcessRpc) await keepKuboUp();
        await createOrConnectRpc();

        const keepKuboUpInterval = setInterval(async () => {
            if (mainProcessExited) return;
            const isRpcPortTaken = await tcpPortUsed.check(Number(plebbitRpcUrl.port), plebbitRpcUrl.hostname);
            if (!plebbitOptionsFromFlag?.kuboRpcClientsOptions && !isRpcPortTaken && !usingDifferentProcessRpc) await keepKuboUp();
            else if (plebbitOptionsFromFlag?.kuboRpcClientsOptions && !usingDifferentProcessRpc) await keepKuboUp();
            await createOrConnectRpc();
        }, 5000);

        const { asyncExitHook } = await import("exit-hook");

        asyncExitHook(
            async () => {
                clearInterval(keepKuboUpInterval);
                if (mainProcessExited) return; // we already exited
                log("Received signal to exit, shutting down both kubo and plebbit rpc. Please wait, it may take a few seconds");

                mainProcessExited = true;
                if (daemonServer)
                    try {
                        await daemonServer.destroy();
                        log("Daemon server shut down");
                    } catch (e) {
                        log.error("Error shutting down daemon server", e);
                    }
                if (kuboProcess?.pid && !kuboProcess.killed) {
                    log("Attempting to kill kubo process with pid", kuboProcess.pid);
                    try {
                        process.kill(kuboProcess.pid, "SIGINT");
                        log("Kubo process killed with pid", kuboProcess.pid);
                    } catch (e) {
                        if (e instanceof Error && "code" in e && e.code === "ESRCH") log("Kubo process already killed");
                        else log.error("Error killing kubo process", e);
                    }
                }
            },
            { wait: 120000 } // could take two minutes to shut down
        );
    }
}
