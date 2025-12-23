import { Flags } from "@oclif/core";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import fs from "fs";
import { BaseCommand } from "../../base-command.js";
import { getPlebbitLogger } from "../../../util.js";
import * as remeda from "remeda";
export default class Create extends BaseCommand {
    static description = "Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions";
    static examples = [
        {
            description: "Create a subplebbit with title 'Hello Plebs' and description 'Welcome'",
            command: "<%= config.bin %> <%= command.id %> --title 'Hello Plebs' --description 'Welcome'"
        }
    ];
    static flags = {
        privateKeyPath: Flags.file({
            exists: true,
            description: "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). If it's not provided then Plebbit will generate a private key"
        })
    };
    async run() {
        const { flags } = await this.parse(Create);
        const log = (await getPlebbitLogger())("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        const createOptions = DataObjectParser.transpose(remeda.omit(flags, ["plebbitRpcUrl", "privateKeyPath"]))["_data"];
        if (flags.privateKeyPath)
            try {
                //@ts-expect-error
                createOptions.signer = { privateKey: (await fs.promises.readFile(flags.privateKeyPath)).toString(), type: "ed25519" };
            }
            catch (e) {
                const error = e;
                //@ts-expect-error
                error.details = { ...error.details, privateKeyPath: flags.privateKeyPath };
                await plebbit.destroy();
                this.error(error);
            }
        try {
            const createdSub = await plebbit.createSubplebbit(createOptions);
            await createdSub.start();
            this.log(createdSub.address);
        }
        catch (e) {
            const error = e;
            //@ts-expect-error
            error.details = { ...error.details, createOptions };
            await plebbit.destroy();
            this.error(error);
        }
        await plebbit.destroy();
    }
}
