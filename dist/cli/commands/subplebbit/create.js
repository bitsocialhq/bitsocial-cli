"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
//@ts-ignore
const dataobject_parser_1 = tslib_1.__importDefault(require("dataobject-parser"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const base_command_js_1 = require("../../base-command.js");
const util_js_1 = require("../../../util.js");
const remeda = tslib_1.__importStar(require("remeda"));
class Create extends base_command_js_1.BaseCommand {
    static description = "Create a subplebbit with specific properties. A newly created sub will be started after creation and be able to receive publications. For a list of properties, visit https://github.com/plebbit/plebbit-js#subplebbiteditsubplebbiteditoptions";
    static examples = [
        {
            description: "Create a subplebbit with title 'Hello Plebs' and description 'Welcome'",
            command: "<%= config.bin %> <%= command.id %> --title 'Hello Plebs' --description 'Welcome'"
        }
    ];
    static flags = {
        privateKeyPath: core_1.Flags.file({
            exists: true,
            description: "Private key (PEM) of the subplebbit signer that will be used to determine address (if address is not a domain). If it's not provided then Plebbit will generate a private key"
        })
    };
    async run() {
        const { flags } = await this.parse(Create);
        const log = (await (0, util_js_1.getPlebbitLogger)())("plebbit-cli:commands:subplebbit:create");
        log(`flags: `, flags);
        const plebbit = await this._connectToPlebbitRpc(flags.plebbitRpcUrl.toString());
        const createOptions = dataobject_parser_1.default.transpose(remeda.omit(flags, ["plebbitRpcUrl", "privateKeyPath"]))["_data"];
        if (flags.privateKeyPath)
            try {
                //@ts-expect-error
                createOptions.signer = { privateKey: (await fs_1.default.promises.readFile(flags.privateKeyPath)).toString(), type: "ed25519" };
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
exports.default = Create;
