import { Flags } from "@oclif/core";
//@ts-expect-error
import type { CreateNewLocalSubplebbitUserOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import lodash from "lodash";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import fs from "fs";
import { BaseCommand } from "../../base-command.js";
import { getPlebbitLogger } from "../../../util.js";

export default class Create extends BaseCommand {
    static override description =
        "Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions";

    static override examples = [
        {
            description: "Create a subplebbit with title 'Hello Plebs' and description 'Welcome'",
            command: "<%= config.bin %> <%= command.id %> --title 'Hello Plebs' --description 'Welcome'"
        }
    ];

    static override flags = {
        privateKeyPath: Flags.file({
            exists: true,
            description:
                "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). If it's not provided then Plebbit will generate a private key"
        })
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Create);

        const log = (await getPlebbitLogger())("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const createOptions: CreateNewLocalSubplebbitUserOptions = DataObjectParser.transpose(
            lodash.omit(flags, ["plebbitRpcApiUrl", "privateKeyPath"])
        )["_data"];
        if (flags.privateKeyPath)
            createOptions.signer = { privateKey: (await fs.promises.readFile(flags.privateKeyPath)).toString(), type: "ed25519" };

        const createdSub = await plebbit.createSubplebbit(createOptions);
        await createdSub.start();

        await plebbit.destroy();
        this.log(createdSub.address);
    }
}
