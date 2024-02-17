"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const url_1 = require("url");
const defaults_js_1 = tslib_1.__importDefault(require("../common-utils/defaults.js"));
class BaseCommand extends core_1.Command {
    static baseFlags = {
        plebbitRpcApiUrl: core_1.Flags.url({
            summary: "URL to Plebbit RPC API",
            required: true,
            default: new url_1.URL(`ws://localhost:${defaults_js_1.default.PLEBBIT_RPC_API_PORT}`)
        })
    };
    async _connectToPlebbitRpc(plebbitRpcApiUrl) {
        const Plebbit = await import("@plebbit/plebbit-js");
        const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcApiUrl] });
        await plebbit.listSubplebbits(); // To make sure we're connected, will throw if there's no connection
        return plebbit;
    }
}
exports.BaseCommand = BaseCommand;
