import { program } from "commander";
import constants from "./cli/constants.js";
import * as actions from "./cli/actions.js";
import fs from "fs-extra";

const packageJson = JSON.parse((await fs.promises.readFile("package.json")).toString());

program.name("plebbit-cli").description(constants.PLEBBIT_CLI_DESCRIPTION).version(packageJson.version);

program
    .command("get")
    .description(constants.CMD_GET)
    .argument("<cid/domain>", "CID of comment/page/subplebbit or domain for subplebbit")
    .action(actions.get);

program.command("daemon").description(constants.CMD_DAEMON).action(actions.daemon);

program.parse(process.argv);
