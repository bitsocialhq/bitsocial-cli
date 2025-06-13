import { Flags } from "@oclif/core";
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
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        const createOptions: any = DataObjectParser.transpose(lodash.omit(flags, ["plebbitRpcUrl", "privateKeyPath"]))["_data"];
        if (flags.privateKeyPath)
            try {
                createOptions.signer = { privateKey: (await fs.promises.readFile(flags.privateKeyPath)).toString(), type: "ed25519" };
            } catch (e) {
                const error = new Error("Failed to load private key from path: " + flags.privateKeyPath);
                //@ts-expect-error
                error.details = { privateKeyPath: flags.privateKeyPath, error: e };
                //@ts-expect-error
                error.stack = e.stack;
                console.error(error);
                await plebbit.destroy();
                this.exit(1);
            }

        try {
            const createdSub = await plebbit.createSubplebbit(createOptions);
            await createdSub.start();
            this.log(createdSub.address);
        } catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, createOptions };
            console.error(e);
            await plebbit.destroy();
            this.exit(1);
        }
        await plebbit.destroy();
    }
}
