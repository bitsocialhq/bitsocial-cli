import { Flags } from "@oclif/core";
import { CreateSubplebbitOptions, SubplebbitType } from "@plebbit/plebbit-js/dist/node/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { statusCodes } from "../../../api/response-statuses.js";
import fetch from "node-fetch";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";
import fs from "fs";

export default class Create extends BaseSubplebbitOptions {
    static override description =
        "Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications";

    static override examples = [
        {
            description: "Create a subplebbit with title 'Hello Plebs' and description 'Welcome'",
            command: "<%= config.bin %> <%= command.id %> --title 'Hello Plebs' --description 'Welcome'"
        }
    ];

    // TODO implement roles, flairs flag
    static override flags = {
        ...BaseSubplebbitOptions.baseSubplebbitFlags,
        privateKeyPath: Flags.file({
            exists: true,
            description:
                "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). If it's not provided then Plebbit will generate a private key"
        })
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Create);

        const log = Logger("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        await this.stopIfDaemonIsDown(flags.apiUrl.toString());
        const createOptions: CreateSubplebbitOptions = DataObjectParser.transpose(lodash.omit(flags, ["apiUrl", "privateKeyPath"]))[
            "_data"
        ];
        if (flags.privateKeyPath)
            createOptions.signer = { privateKey: (await fs.promises.readFile(flags.privateKeyPath)).toString(), type: "ed25519" };

        const createRes = await fetch(`${flags.apiUrl}/subplebbit/create`, {
            body: JSON.stringify(createOptions),
            method: "POST",
            headers: { "content-type": "application/json" }
        });
        if (createRes.status !== statusCodes.SUCCESS_SUBPLEBBIT_CREATED)
            // TODO, status text is not enough to explain error. Include more info
            this.error(createRes.statusText);

        const createdSub: SubplebbitType = await createRes.json();

        // Attempt to start the newly created sub
        const startRes = await fetch(`${flags.apiUrl}/subplebbit/start?address=${createdSub.address}`, { method: "POST" });
        if (startRes.status !== statusCodes.SUCCESS_SUBPLEBBIT_STARTED) this.error(startRes.statusText);

        this.log(createdSub.address);
    }
}
