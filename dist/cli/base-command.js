"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const defaults_js_1 = tslib_1.__importDefault(require("../common-utils/defaults.js"));
class BaseCommand extends core_1.Command {
    static baseFlags = {
        plebbitRpcUrl: core_1.Flags.url({
            summary: "URL to Plebbit RPC",
            required: true,
            default: defaults_js_1.default.PLEBBIT_RPC_URL
        })
    };
    async _connectToPlebbitRpc(plebbitRpcUrl) {
        const Plebbit = await import("@plebbit/plebbit-js");
        const plebbit = await Plebbit.default({ plebbitRpcClientsOptions: [plebbitRpcUrl] });
        plebbit.on("error", (err) => console.error("Error from plebbit instance", err));
        await new Promise((resolve) => plebbit.once("subplebbitschange", resolve));
        return plebbit;
    }
}
exports.BaseCommand = BaseCommand;
