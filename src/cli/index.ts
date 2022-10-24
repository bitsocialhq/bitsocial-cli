#!/usr/bin/env node
import { program } from "commander";
import constants from "./constants.js";
import * as actions from "./actions.js";
import fs from "fs-extra";
import defaults from "./defaults.js";
import { CreateSubplebbitOptions, DaemonOptions, ListSubplebbitOptions } from "../types.js";

const packageJson = JSON.parse((await fs.promises.readFile("package.json")).toString());

program.name("plebbit-cli").description(constants.PLEBBIT_CLI_DESCRIPTION).version(packageJson.version);

// 'plebbit' options that will be passed to all commands

program.option("--plebbit-api-url <url>", "URL to Plebbit API", `http://localhost:${defaults.PLEBBIT_API_PORT}/api/v0`);

// Root commands

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
    .action((options: DaemonOptions) => actions.daemon(options));

const subplebbitCommand = program.command("subplebbit").description(constants.CMD_SUBPLEBBIT);

// Commands under "plebbit subplebbit"

subplebbitCommand
    .command("list")
    .description(constants.CMD_SUBPLEBBIT_LIST)
    .option("-q, --quiet", "Only display subplebbit addresses", false)
    .action((options: ListSubplebbitOptions) => actions.subplebbitList({ ...program.opts(), ...options }));

subplebbitCommand
    .command("create")
    .description(constants.CMD_SUBPLEBBIT_CREATE)
    .option("-pp, --pretty-print", "Pretty print the JSON output", false)
    .argument("<json>", 'Options for the subplebbit instance. Use "{"address": "Qm.."}" to retrieve an already created subplebbit')
    .action((createOptions: string, options: Omit<CreateSubplebbitOptions, "createOptions">) =>
        actions.subplebbitCreate({ ...program.opts(), ...options, createOptions })
    );

program.parse(process.argv);
