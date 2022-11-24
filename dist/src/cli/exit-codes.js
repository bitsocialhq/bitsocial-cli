"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitStatuses = exports.exitCodes = exports.exitMessages = void 0;
var exitMessages;
(function (exitMessages) {
    exitMessages["ERR_DAEMON_IS_DOWN"] = "Daemon is down. Please run 'plebbit daemon' before executing this command";
})(exitMessages = exports.exitMessages || (exports.exitMessages = {}));
var exitCodes;
(function (exitCodes) {
    exitCodes["ERR_DAEMON_IS_DOWN"] = "ERROR_DAEMON_IS_DOWN";
})(exitCodes = exports.exitCodes || (exports.exitCodes = {}));
// Bash exit status. A number from 1-255. If a command exits with status '0' then it has succeeded
var exitStatuses;
(function (exitStatuses) {
    exitStatuses[exitStatuses["ERR_DAEMON_IS_DOWN"] = 1] = "ERR_DAEMON_IS_DOWN";
    exitStatuses[exitStatuses["ERR_SUB_ALREADY_STARTED"] = 2] = "ERR_SUB_ALREADY_STARTED";
    exitStatuses[exitStatuses["ERR_SUBPLEBBIT_DOES_NOT_EXIST"] = 3] = "ERR_SUBPLEBBIT_DOES_NOT_EXIST";
})(exitStatuses = exports.exitStatuses || (exports.exitStatuses = {}));
