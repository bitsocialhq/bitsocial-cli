"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlebbitLogger = void 0;
async function getPlebbitLogger() {
    const Logger = await import("@plebbit/plebbit-logger");
    return Logger.default;
}
exports.getPlebbitLogger = getPlebbitLogger;
