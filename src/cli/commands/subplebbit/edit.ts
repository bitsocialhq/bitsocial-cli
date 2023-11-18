import { SubplebbitEditOptions } from "@plebbit/plebbit-js/dist/node/subplebbit/types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
//@ts-ignore
import DataObjectParser from "dataobject-parser";
import { Args } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";

export default class Edit extends BaseCommand {
    static override description =
        "Edit a subplebbit properties. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions";

    static override args = {
        address: Args.string({
            name: "address",
            required: true,
            description: "Address of the subplebbit address to edit"
        })
    };

    static override examples = [
        {
            description: "Change the address of the sub to a new ENS address",
            command: "plebbit subplebbit edit 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu --address newAddress.eth"
        },
        {
            description: "Add the author address 'esteban.eth' as an admin on the sub",
            command: `plebbit subplebbit edit mysub.eth '--roles["esteban.eth"].role' admin`
        },
        {
            description:
                "Add two challenges to the sub. The first challenge will be a question and answer, and the second will be an image captcha",
            command: `plebbit subplebbit edit mysub.eth --settings.challenges[0].name question --settings.challenges[0].options.question "what is the password?" --settings.challenges[0].options.answer thepassword --settings.challenges[1].name captcha-canvas-v3`
        },
        {
            description: "Change the title and description",
            command: `plebbit subplebbit edit mysub.eth --title "This is the new title" --description "This is the new description" `
        }
    ];

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
