"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitStatuses = exports.exitMessages = void 0;
var exitMessages;
(function (exitMessages) {
    exitMessages["ERR_DAEMON_IS_DOWN"] = "Daemon is down. Please run 'plebbit daemon' before executing this command";
    exitMessages["ERR_AUTHOR_ROLE_DOES_NOT_EXIST"] = "Author does not have any roles to remove";
})(exitMessages || (exports.exitMessages = exitMessages = {}));
// Bash exit status. A number from 1-255. If a command exits with status '0' then it has succeeded
var exitStatuses;
(function (exitStatuses) {
    exitStatuses[exitStatuses["ERR_DAEMON_IS_DOWN"] = 1] = "ERR_DAEMON_IS_DOWN";
    exitStatuses[exitStatuses["ERR_SUB_ALREADY_STARTED"] = 2] = "ERR_SUB_ALREADY_STARTED";
    exitStatuses[exitStatuses["ERR_SUBPLEBBIT_DOES_NOT_EXIST"] = 3] = "ERR_SUBPLEBBIT_DOES_NOT_EXIST";
    exitStatuses[exitStatuses["ERR_AUTHOR_ROLE_DOES_NOT_EXIST"] = 4] = "ERR_AUTHOR_ROLE_DOES_NOT_EXIST";
    exitStatuses[exitStatuses["ERR_SUBPLEBBIT_NOT_RUNNING"] = 5] = "ERR_SUBPLEBBIT_NOT_RUNNING";
})(exitStatuses || (exports.exitStatuses = exitStatuses = {}));
