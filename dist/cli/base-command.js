"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const url_1 = require("url");
const defaults_js_1 = tslib_1.__importDefault(require("../common-utils/defaults.js"));
const plebbit_js_1 = tslib_1.__importDefault(require("@plebbit/plebbit-js"));
class BaseCommand extends core_1.Command {
    constructor() {
        super(...arguments);
        this._connectToPlebbitRpc = async (plebbitRpcApiUrl) => {
            const plebbit = await (0, plebbit_js_1.default)({ plebbitRpcClientsOptions: [plebbitRpcApiUrl] });
            await plebbit.listSubplebbits(); // To make sure we're connected
            return plebbit;
        };
    }
}
exports.BaseCommand = BaseCommand;
BaseCommand.baseFlags = {
    plebbitRpcApiUrl: core_1.Flags.url({
        summary: "URL to Plebbit RPC API",
        required: true,
        default: new url_1.URL(`ws://localhost:${defaults_js_1.default.PLEBBIT_RPC_API_PORT}`)
    })
};
