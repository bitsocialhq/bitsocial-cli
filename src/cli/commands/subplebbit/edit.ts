import { SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import BaseSubplebbitOptions from "../../base-subplebbit-options.js";
import { Flags, Args } from "@oclif/core";

export default class Edit extends BaseSubplebbitOptions {
    static override description = "Edit a subplebbit";

    static override args = {
        address: Args.string({
            name: "address",
            required: true,
            description: "Address of the subplebbit address to edit"
        })
    };

    static override examples = [];

    // TODO implement roles, flairs flag
    static override flags = {
        ...BaseSubplebbitOptions.baseSubplebbitFlags,
        address: Flags.string({ summary: "New address of the subplebbit" })
    };

    async run(): Promise<void> {
        const { flags, args } = await this.parse(Edit);

        const log = Logger("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());
        const editOptions: SubplebbitEditOptions = DataObjectParser.transpose(lodash.omit(flags, ["plebbitRpcApiUrl"]))["_data"];

        const sub = await plebbit.createSubplebbit({ address: args.address });
        await sub.edit(editOptions);

        this.log(sub.address);
        await plebbit.destroy();
    }
}
