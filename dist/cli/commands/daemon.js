"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const defaults_js_1 = tslib_1.__importDefault(require("../../common-utils/defaults.js"));
const startIpfs_js_1 = require("../../ipfs/startIpfs.js");
const path_1 = tslib_1.__importDefault(require("path"));
const tcp_port_used_1 = tslib_1.__importDefault(require("tcp-port-used"));
const util_js_1 = require("../../util.js");
const daemon_server_js_1 = require("../../webui/daemon-server.js");
const fs_1 = tslib_1.__importDefault(require("fs"));
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const node_os_1 = require("node:os");
class Daemon extends core_1.Command {
    static description = "Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any machine. Within the web ui users are able to browse, create and manage their subs fully P2P";
    static flags = {
        plebbitDataPath: core_1.Flags.directory({
            description: "Path to plebbit data path where subplebbits and ipfs node are stored",
            required: true,
            default: defaults_js_1.default.PLEBBIT_DATA_PATH
        }),
        plebbitRpcPort: core_1.Flags.integer({
            description: "Specify Plebbit RPC port to listen on",
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
    static examples = ["plebbit daemon", "plebbit daemon --plebbitRpcPort 80"];
    _setupLogger(Logger) {
        const envDebug = process.env["DEBUG"];
        const debugNamespace = envDebug === "0" || envDebug === "" ? undefined : envDebug || "plebbit*, -plebbit*trace";
        if (debugNamespace) {
            console.log("Debug logs is on with namespace", `"${debugNamespace}"`);
            Logger.enable(debugNamespace);
        }
        else {
            console.log("Debug logs are disabled");
            Logger.disable();
        }
    }
    async _getNewLogfileByEvacuatingOldLogsIfNeeded() {
        try {
            await promises_1.default.mkdir(defaults_js_1.default.PLEBBIT_LOG_PATH, { recursive: true });
        }
        catch (e) {
            //@ts-expect-error
            if (e.code !== "EEXIST")
                throw e;
        }
        const logFiles = (await promises_1.default.readdir(defaults_js_1.default.PLEBBIT_LOG_PATH, { withFileTypes: true })).filter((file) => file.name.startsWith("plebbit_cli_daemon"));
        const logfilesCapacity = 5; // we only store 5 log files
        if (logFiles.length >= logfilesCapacity) {
            // we need to pick the oldest log to delete
            const logFileToDelete = logFiles.map((logFile) => logFile.name).sort()[0]; // TODO need to test this, not sure if it works
            console.log(`Will remove log (${logFileToDelete}) because we reached capacity (${logfilesCapacity})`);
            await promises_1.default.rm(path_1.default.join(defaults_js_1.default.PLEBBIT_LOG_PATH, logFileToDelete));
        }
        return path_1.default.join(defaults_js_1.default.PLEBBIT_LOG_PATH, `plebbit_cli_daemon_${new Date().toISOString()}.log`);
    }
    async _pipeDebugLogsToLogFile() {
        const logFilePath = await this._getNewLogfileByEvacuatingOldLogsIfNeeded();
        const logFile = fs_1.default.createWriteStream(logFilePath, { flags: "a" });
        const stdoutWrite = process.stdout.write.bind(process.stdout);
        const stderrWrite = process.stderr.write.bind(process.stderr);
        const removeColor = (data) => {
            const parsedData = data instanceof Uint8Array ? Buffer.from(data).toString() : data;
            return parsedData.replaceAll(/\u001b\[.*?m/g, "");
        };
        process.stdout.write = (...args) => {
            //@ts-expect-error
            const res = stdoutWrite(...args);
            logFile.write(removeColor(args[0]) + node_os_1.EOL);
            return res;
        };
        process.stderr.write = (...args) => {
            //@ts-expect-error
            const res = stderrWrite(...args);
            logFile.write(removeColor(args[0]).trimStart() + node_os_1.EOL);
            return res;
        };
        console.log("Will store stderr + stdout log to", logFilePath);
        // errors aren't console logged
        process.on("uncaughtException", console.error);
        process.on("unhandledRejection", console.error);
    }
    async run() {
        const { flags } = await this.parse(Daemon);
        const Logger = await (0, util_js_1.getPlebbitLogger)();
        this._setupLogger(Logger);
        await this._pipeDebugLogsToLogFile();
        const log = Logger("plebbit-cli:daemon");
        log(`flags: `, flags);
        const ipfsApiEndpoint = `http://localhost:${flags.ipfsApiPort}/api/v0`;
        const ipfsGatewayEndpoint = `http://localhost:${flags.ipfsGatewayPort}`;
        let mainProcessExited = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess;
        const keepIpfsUp = async () => {
            if (ipfsProcess || usingDifferentProcessRpc)
                return; // already started, no need to intervene
            const isIpfsApiPortTaken = await tcp_port_used_1.default.check(flags.ipfsApiPort, "127.0.0.1");
            if (isIpfsApiPortTaken) {
                log(`Ipfs API already running on port (${flags.ipfsApiPort}) by another program. Plebbit-cli will use the running ipfs daemon instead of starting a new one`);
                return;
            }
            ipfsProcess = await (0, startIpfs_js_1.startIpfsNode)(flags.ipfsApiPort, flags.ipfsGatewayPort);
            log(`Started ipfs process with pid (${ipfsProcess.pid})`);
            console.log(`IPFS API listening on: ${ipfsApiEndpoint}`);
            console.log(`IPFS Gateway listening on: ${ipfsGatewayEndpoint}`);
            ipfsProcess.on("exit", async () => {
                // Restart IPFS process because it failed
                log(`Ipfs node with pid (${ipfsProcess?.pid}) exited`);
                if (!mainProcessExited) {
                    ipfsProcess = undefined;
                    await keepIpfsUp();
                }
                else
                    ipfsProcess.removeAllListeners();
            });
        };
        let startedOwnRpc = false;
        let usingDifferentProcessRpc = false;
        const createOrConnectRpc = async () => {
            if (startedOwnRpc)
                return;
            const isRpcPortTaken = await tcp_port_used_1.default.check(flags.plebbitRpcPort, "127.0.0.1");
            if (isRpcPortTaken && usingDifferentProcessRpc)
                return;
            if (isRpcPortTaken) {
                log(`Plebbit RPC is already running on port (${flags.plebbitRpcPort}) by another program. Plebbit-cli will use the running RPC server, and if shuts down, plebbit-cli will start a new RPC instance`);
                const plebbitRpcApiUrl = `ws://localhost:${flags.plebbitRpcPort}`;
                console.log("Using the already started RPC server at:", plebbitRpcApiUrl);
                console.log("plebbit-cli daemon will monitor the plebbit RPC and ipfs API to make sure they're always up");
                const Plebbit = await import("@plebbit/plebbit-js");
                const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcApiUrl] });
                plebbit.on("error", () => { });
                console.log(`Subplebbits in data path: `, await plebbit.listSubplebbits());
                usingDifferentProcessRpc = true;
                return;
            }
            const daemonServer = await (0, daemon_server_js_1.startDaemonServer)(flags.plebbitRpcPort, flags.ipfsGatewayPort, ipfsApiEndpoint, flags.plebbitDataPath);
            usingDifferentProcessRpc = false;
            startedOwnRpc = true;
            console.log(`plebbit rpc: listening on ws://localhost:${flags.plebbitRpcPort} (local connections only)`);
            console.log(`plebbit rpc: listening on ws://localhost:${flags.plebbitRpcPort}/${daemonServer.rpcAuthKey} (secret auth key for remote connections)`);
            console.log(`Plebbit data path: ${path_1.default.resolve(flags.plebbitDataPath)}`);
            console.log(`Subplebbits in data path: `, daemonServer.listedSub);
            const localIpAddress = "localhost";
            const remoteIpAddress = (0, util_js_1.getLanIpV4Address)() || localIpAddress;
            for (const webui of daemonServer.webuis) {
                console.log(`WebUI (${webui.name}): http://${localIpAddress}:${flags.plebbitRpcPort}${webui.endpointLocal} (local connections only)`);
                console.log(`WebUI (${webui.name}): http://${remoteIpAddress}:${flags.plebbitRpcPort}${webui.endpointRemote} (secret auth key for remote connections)`);
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
            if (typeof ipfsProcess?.pid === "number" && !ipfsProcess.killed)
                process.kill(ipfsProcess.pid);
        });
    }
}
exports.default = Daemon;
