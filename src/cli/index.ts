#!/usr/bin/env node
import { program } from "commander";
import constants from "./constants.js";
import * as actions from "./actions.js";
import fs from "fs-extra";
import defaults from "./defaults.js";
import { CreateSubplebbitOptions, DaemonOptions, ListSubplebbitOptions } from "../types.js";
//@ts-ignore
import DataObjectParser from "dataobject-parser";

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

// TODO implement flairs, challenges, and roles separately
subplebbitCommand
    .command("create")
    .description(constants.CMD_SUBPLEBBIT_CREATE)
    .option("-pp, --pretty-print", "Pretty print the JSON output", false)
    .option("--address <ipns/domain>", "Address of the subplebbit. Can be used to retrieve an already existing subplebbit")
    .option(
        "--signer.privateKey <PEM>",
        "Private key of the subplebbit signer that will be used to determine address (if address is not a domain). Only needed if you're creating a new subplebbit"
    )
    .option("--database.connection.filename <file-path>", "Path to the subplebbit sqlite file")
    .option("--title <string>", "Title of the subplebbit")
    .option("--description <string>", "Description of the subplebbit")
    // .option("--roles", "Comma separated address-to-role mapping (<address>=<role>)")
    .option("--pubsubTopic <string>", "The string to publish to in the pubsub, a public key of the subplebbit owner's choice")
    // .option("--challengeTypes", "Comma separated ") // Not done
    .option("--suggested.primaryColor <string>", "Primary color of the subplebbit")
    .option("--suggested.secondaryColor <string>", "Secondary color of the subplebbit")
    .option("--suggested.avatarUrl <URL>", "The URL of the subplebbit's avatar")
    .option("--suggested.bannerUrl <URL>", "The URL of the subplebbit's banner")
    .option("--suggested.backgroundUrl <URL>", "The URL of the subplebbit's background")
    .option("--suggested.language <string>", "The language of the subplebbit")
    // .option("--flairs.post")
    .option(
        "--settings.fetchThumbnailUrls",
        "Fetch the thumbnail URLs of comments comment.link property, could reveal the IP address of the subplebbit node"
    )
    .option("--settings.fetchThumbnailUrlsProxyUrl", "The HTTP proxy URL used to fetch thumbnail URLs")
    .action((options: any) => {
        const transposedData = DataObjectParser.transpose(options)["_data"];
        actions.subplebbitCreate({ ...program.opts(), ...(<CreateSubplebbitOptions>transposedData) });
    });


program.parse(process.argv);
