import { program } from "commander";
import constants from "./constants.js";
import * as actions from "./actions.js";
import fs from "fs-extra";
import defaults from "./defaults.js";

const packageJson = JSON.parse((await fs.promises.readFile("package.json")).toString());

program.name("plebbit-cli").description(constants.PLEBBIT_CLI_DESCRIPTION).version(packageJson.version);

program
    .command("get")
    .description(constants.CMD_GET)
    .argument("<cid/domain>", "CID of comment/page/subplebbit or domain for subplebbit")
    .action(actions.get);

program
    .command("daemon")
    .description(constants.CMD_DAEMON)
    .option(
        "--plebbit-data-path <path>",
        "Path to plebbit data path where subplebbits and ipfs node are stored",
        defaults.PLEBBIT_DATA_PATH
    )
    .option("--plebbit-api-port <number>", "Specify Plebbit API port", String(defaults.PLEBBIT_API_PORT))
    .option("--ipfs-api-port <number>", "Specify the API port of the ipfs node that will be ran", String(defaults.IPFS_API_PORT))
    .option(
        "--ipfs-gateway-port <number>",
        "Specify the gateway port of the ipfs node that will be ran",
        String(defaults.IPFS_GATEWAY_PORT)
    )
    .action(actions.daemon);

program.parse(process.argv);
