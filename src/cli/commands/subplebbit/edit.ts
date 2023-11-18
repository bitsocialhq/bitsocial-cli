import { SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import { Args } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";

export default class Edit extends BaseCommand {
    static override description = "Edit a subplebbit";

    static override args = {
        address: Args.string({
            name: "address",
            required: true,
            description: "Address of the subplebbit address to edit"
        })
    };

    static override examples = [];

    async run(): Promise<void> {
        const { flags, args } = await this.parse(Edit);

        const log = Logger("plebbit-cli:commands:subplebbit:edit");
        log(`flags: `, flags);
        const editOptions: SubplebbitEditOptions = DataObjectParser.transpose(lodash.omit(flags, ["plebbitRpcApiUrl"]))["_data"];
        log("Edit options parsed:", editOptions);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcApiUrl.toString());

        const sub = await plebbit.createSubplebbit({ address: args.address });
        const mergedSubState = lodash.pick(sub.toJSONInternal(), Object.keys(editOptions));
        lodash.merge(mergedSubState, editOptions);
        log("Internal sub state after merge:", mergedSubState);
        await sub.edit(mergedSubState);

        this.log(sub.address);
        await plebbit.destroy();
    }
}
