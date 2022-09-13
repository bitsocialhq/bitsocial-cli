import { program } from "commander";
import constants from "./constants";
import * as actions from "./actions";
import { version } from "../package.json";

program.name("plebbit-cli").description(constants.PLEBBIT_CLI_DESCRIPTION).version(version);

program
    .command("get")
    .description(constants.CMD_GET)
    .argument("<cid/domain>", "CID of comment/page/subplebbit or domain for subplebbit")
    .action(actions.get);

program.parse(process.argv);
