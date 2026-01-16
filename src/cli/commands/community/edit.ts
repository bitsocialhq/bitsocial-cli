//@ts-expect-error
import DataObjectParser from "dataobject-parser";
import { Args } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";
import { getPlebbitLogger, mergeDeep } from "../../../util.js";
import * as remeda from "remeda";

export default class Edit extends BaseCommand {
    static override description =
        "Edit a community's properties. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions";

    static override args = {
        address: Args.string({
            name: "address",
            required: true,
            description: "Address of the community to edit"
        })
    };

    static override examples = [
        {
            description: "Change the address of the community to a new ENS address",
            command: "bitsocial community edit 12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu --address newAddress.eth"
        },
        {
            description: "Add the author address 'esteban.eth' as an admin on the community",
            command: `bitsocial community edit mysub.eth '--roles["esteban.eth"].role' admin`
        },
        {
            description:
                "Add two challenges to the community. The first challenge will be a question and answer, and the second will be an image captcha",
            command: `bitsocial community edit mysub.eth --settings.challenges[0].name question --settings.challenges[0].options.question "what is the password?" --settings.challenges[0].options.answer thepassword --settings.challenges[1].name captcha-canvas-v3`
        },
        {
            description: "Change the title and description",
            command: `bitsocial community edit mysub.eth --title "This is the new title" --description "This is the new description" `
        },
        {
            description: "Remove a role from a moderator/admin/owner",
            command: "bitsocial community edit plebbit.eth --roles['rinse12.eth'] null"
        },
        {
            description: "Enable settings.fetchThumbnailUrls to fetch the thumbnail of url submitted by authors",
            command: "bitsocial community edit plebbit.eth --settings.fetchThumbnailUrls"
        },
        {
            description: "disable settings.fetchThumbnailUrls",
            command: "bitsocial community edit plebbit.eth --settings.fetchThumbnailUrls=false"
        }
    ];

    async run(): Promise<void> {
        const { flags, args } = await this.parse(Edit);

        const log = (await getPlebbitLogger())("bitsocial-cli:commands:community:edit");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());

        const editOptions = DataObjectParser.transpose(remeda.omit(flags, ["plebbitRpcUrl"]))["_data"];
        log("Edit options parsed:", editOptions);

        const localSubs = plebbit.subplebbits;
        if (!localSubs.includes(args.address)) this.error("Can't edit a remote community, make sure you're editing a local community");

        try {
            const sub = await plebbit.createSubplebbit({ address: args.address });

            const mergedSubState = remeda.pick(sub, remeda.keys.strict(editOptions));
            const finalMergedState = mergeDeep(mergedSubState, editOptions);
            log("Internal sub state after merge:", finalMergedState);
            await sub.edit(finalMergedState);
            this.log(sub.address);
        } catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, editOptions, address: args.address };
            console.error(e);
            await plebbit.destroy();
            this.exit(1);
        }
        await plebbit.destroy();
    }
}
