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
//@ts-expect-error
const dataobject_parser_1 = tslib_1.__importDefault(require("dataobject-parser"));
const remeda = tslib_1.__importStar(require("remeda"));
const defaultPlebbitOptions = {
    dataPath: defaults_js_1.default.PLEBBIT_DATA_PATH,
    httpRoutersOptions: defaults_js_1.default.HTTP_TRACKERS
};
class Daemon extends core_1.Command {
    static description = `Run a network-connected Plebbit node. Once the daemon is running you can create and start your subplebbits and receive publications from users. The daemon will also serve web ui on http that can be accessed through a browser on any machine. Within the web ui users are able to browse, create and manage their subs fully P2P.
    Options can be passed to the RPC's instance through flag --plebbitOptions.optionName. For a list of plebbit options (https://github.com/plebbit/plebbit-js?tab=readme-ov-file#plebbitoptions)
    If you need to modify ipfs config, you should head to {plebbit-data-path}/.ipfs-plebbit-cli/config and modify the config file
    `;
    static flags = {
        plebbitRpcUrl: core_1.Flags.url({
            description: "Specify Plebbit RPC URL to listen on",
            required: true,
            default: defaults_js_1.default.PLEBBIT_RPC_URL
        }),
        logPath: core_1.Flags.directory({
            description: "Specify a directory which will be used to store logs",
            required: true,
            default: defaults_js_1.default.PLEBBIT_LOG_PATH
        })
    };
    static examples = [
        "plebbit daemon",
        "plebbit daemon --plebbitRpcUrl ws://localhost:53812",
        "plebbit daemon --plebbitOptions.dataPath /tmp/plebbit-datapath/",
        "plebbit daemon --plebbitOptions.chainProviders.eth[0].url https://ethrpc.com",
        "plebbit daemon --plebbitOptions.ipfsHttpClientsOptions[0] https://remoteipfsnode.com"
    ];
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
    async _getNewLogfileByEvacuatingOldLogsIfNeeded(logPath) {
        try {
            await promises_1.default.mkdir(logPath, { recursive: true });
        }
        catch (e) {
            //@ts-expect-error
            if (e.code !== "EEXIST")
                throw e;
        }
        const logFiles = (await promises_1.default.readdir(logPath, { withFileTypes: true })).filter((file) => file.name.startsWith("plebbit_cli_daemon"));
        const logfilesCapacity = 5; // we only store 5 log files
        if (logFiles.length >= logfilesCapacity) {
            // we need to pick the oldest log to delete
            const logFileToDelete = logFiles.map((logFile) => logFile.name).sort()[0]; // TODO need to test this, not sure if it works
            console.log(`Will remove log (${logFileToDelete}) because we reached capacity (${logfilesCapacity})`);
            await promises_1.default.rm(path_1.default.join(logPath, logFileToDelete));
        }
        return path_1.default.join(logPath, `plebbit_cli_daemon_${new Date().toISOString().replace(/:/g, "-")}.log`);
    }
    async _pipeDebugLogsToLogFile(logPath) {
        const logFilePath = await this._getNewLogfileByEvacuatingOldLogsIfNeeded(logPath);
        const logFile = fs_1.default.createWriteStream(logFilePath, { flags: "a" });
        const stdoutWrite = process.stdout.write.bind(process.stdout);
        const stderrWrite = process.stderr.write.bind(process.stderr);
        const removeColor = (data) => {
            const parsedData = data instanceof Uint8Array ? Buffer.from(data).toString() : data;
            return parsedData.replaceAll(/\u001b\[.*?m/g, "");
        };
        const isLogFileOverLimit = () => logFile.bytesWritten > 20000000; // 20mb
        process.stdout.write = (...args) => {
            //@ts-expect-error
            const res = stdoutWrite(...args);
            if (!isLogFileOverLimit())
                logFile.write(removeColor(args[0]) + node_os_1.EOL);
            return res;
        };
        process.stderr.write = (...args) => {
            //@ts-expect-error
            const res = stderrWrite(...args);
            if (!isLogFileOverLimit())
                logFile.write(removeColor(args[0]).trimStart() + node_os_1.EOL);
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
        const Logger = await (0, util_js_1.getPlebbitLogger)();
        this._setupLogger(Logger);
        await this._pipeDebugLogsToLogFile(flags.logPath);
        const log = Logger("plebbit-cli:daemon");
        log(`flags: `, flags);
        const plebbitRpcUrl = new URL(flags.plebbitRpcUrl);
        const plebbitOptionsFlagNames = Object.keys(flags).filter((flag) => flag.startsWith("plebbitOptions"));
        const plebbitOptionsFromFlag = plebbitOptionsFlagNames.length > 0
            ? dataobject_parser_1.default.transpose(remeda.pick(flags, plebbitOptionsFlagNames))["_data"]?.["plebbitOptions"]
            : undefined;
        if (plebbitOptionsFromFlag?.plebbitRpcClientsOptions && plebbitRpcUrl.toString() !== defaults_js_1.default.PLEBBIT_RPC_URL.toString()) {
            this.error("Can't provide plebbitOptions.plebbitRpcClientsOptions and --plebbitRpcUrl simuatelounsly. You have to choose between connecting to an RPC or starting up a new RPC");
        }
        if (plebbitOptionsFromFlag?.ipfsHttpClientsOptions && plebbitOptionsFromFlag.ipfsHttpClientsOptions.length !== 1)
            this.error("Can't provide plebbitOptions.ipfsHttpClientOptions as an array with more than 1 element, or as a non array");
        if (plebbitOptionsFromFlag?.ipfsGatewayUrls && plebbitOptionsFromFlag.ipfsGatewayUrls.length !== 1)
            this.error("Can't provide plebbitOptions.ipfsGatewayUrls as an array with more than 1 element, or as a non array");
        const ipfsConfig = await (0, util_js_1.loadIpfsConfigFile)(plebbitOptionsFromFlag?.dataPath || defaultPlebbitOptions.dataPath);
        const ipfsApiEndpoint = plebbitOptionsFromFlag?.ipfsHttpClientsOptions
            ? new URL(plebbitOptionsFromFlag.ipfsHttpClientsOptions[0].toString())
            : ipfsConfig?.["Addresses"]?.["API"]
                ? await (0, util_js_1.parseMultiAddrIpfsApiToUrl)(ipfsConfig?.["Addresses"]?.["API"])
                : defaults_js_1.default.IPFS_API_URL;
        const ipfsGatewayEndpoint = plebbitOptionsFromFlag?.ipfsGatewayUrls
            ? new URL(plebbitOptionsFromFlag.ipfsGatewayUrls[0])
            : ipfsConfig?.["Addresses"]?.["Gateway"]
                ? await (0, util_js_1.parseMultiAddrIpfsGatewayToUrl)(ipfsConfig?.["Addresses"]?.["Gateway"])
                : defaults_js_1.default.IPFS_GATEWAY_URL;
        defaultPlebbitOptions.ipfsHttpClientsOptions = [ipfsApiEndpoint.toString()];
        const mergedPlebbitOptions = { ...defaultPlebbitOptions, ...plebbitOptionsFromFlag };
        log("Merged plebbit options that will be used for this node", mergedPlebbitOptions);
        let mainProcessExited = false;
        // Ipfs Node may fail randomly, we need to set a listener so when it exits because of an error we restart it
        let ipfsProcess;
        const keepIpfsUp = async () => {
            const ipfsApiPort = Number(ipfsApiEndpoint.port);
            if (ipfsProcess || usingDifferentProcessRpc)
                return; // already started, no need to intervene
            const isIpfsApiPortTaken = await tcp_port_used_1.default.check(ipfsApiPort, ipfsApiEndpoint.hostname);
            if (isIpfsApiPortTaken) {
                log.trace(`Ipfs API already running on port (${ipfsApiPort}) by another program. Plebbit-cli will use the running ipfs daemon instead of starting a new one`);
                return;
            }
            ipfsProcess = await (0, startIpfs_js_1.startIpfsNode)(ipfsApiEndpoint, ipfsGatewayEndpoint, mergedPlebbitOptions.dataPath);
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
            const isRpcPortTaken = await tcp_port_used_1.default.check(Number(plebbitRpcUrl.port), plebbitRpcUrl.hostname);
            if (isRpcPortTaken && usingDifferentProcessRpc)
                return;
            if (isRpcPortTaken) {
                log(`Plebbit RPC is already running (${plebbitRpcUrl}) by another program. Plebbit-cli will use the running RPC server, and if shuts down, plebbit-cli will start a new RPC instance`);
                console.log("Using the already started RPC server at:", plebbitRpcUrl);
                console.log("plebbit-cli daemon will monitor the plebbit RPC and ipfs API to make sure they're always up");
                const Plebbit = await import("@plebbit/plebbit-js");
                const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcUrl.toString()] });
                await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
                plebbit.on("error", () => { });
                console.log(`Subplebbits in data path: `, plebbit.subplebbits);
                usingDifferentProcessRpc = true;
                return;
            }
            const daemonServer = await (0, daemon_server_js_1.startDaemonServer)(plebbitRpcUrl, ipfsGatewayEndpoint, mergedPlebbitOptions);
            usingDifferentProcessRpc = false;
            startedOwnRpc = true;
            console.log(`plebbit rpc: listening on ${plebbitRpcUrl} (local connections only)`);
            console.log(`plebbit rpc: listening on ${plebbitRpcUrl}/${daemonServer.rpcAuthKey} (secret auth key for remote connections)`);
            console.log(`Plebbit data path: ${path_1.default.resolve(mergedPlebbitOptions.dataPath)}`);
            console.log(`Subplebbits in data path: `, daemonServer.listedSub);
            const localIpAddress = "localhost";
            const remoteIpAddress = (0, util_js_1.getLanIpV4Address)() || localIpAddress;
            const rpcPort = plebbitRpcUrl.port;
            for (const webui of daemonServer.webuis) {
                console.log(`WebUI (${webui.name}): http://${localIpAddress}:${rpcPort}${webui.endpointLocal} (local connections only)`);
                console.log(`WebUI (${webui.name}): http://${remoteIpAddress}:${rpcPort}${webui.endpointRemote} (secret auth key for remote connections)`);
            }
        };
        const isRpcPortTaken = await tcp_port_used_1.default.check(Number(plebbitRpcUrl.port), plebbitRpcUrl.hostname);
        if (!plebbitOptionsFromFlag?.ipfsHttpClientsOptions && !isRpcPortTaken && !usingDifferentProcessRpc)
            await keepIpfsUp();
        await createOrConnectRpc();
        setInterval(async () => {
            const isRpcPortTaken = await tcp_port_used_1.default.check(Number(plebbitRpcUrl.port), plebbitRpcUrl.hostname);
            if (!plebbitOptionsFromFlag?.ipfsHttpClientsOptions && !isRpcPortTaken && !usingDifferentProcessRpc)
                await keepIpfsUp();
            else if (plebbitOptionsFromFlag?.ipfsHttpClientsOptions && !usingDifferentProcessRpc)
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
