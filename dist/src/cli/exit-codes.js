export var exitMessages;
(function (exitMessages) {
    exitMessages["ERR_DAEMON_IS_DOWN"] = "Daemon is down. Please run 'plebbit daemon' before executing this command";
})(exitMessages || (exitMessages = {}));
export var exitCodes;
(function (exitCodes) {
    exitCodes["ERR_DAEMON_IS_DOWN"] = "ERROR_DAEMON_IS_DOWN";
})(exitCodes || (exitCodes = {}));
// Bash exit status. A number from 1-255. If a command exits with status '0' then it has succeeded
export var exitStatuses;
(function (exitStatuses) {
    exitStatuses[exitStatuses["ERR_DAEMON_IS_DOWN"] = 1] = "ERR_DAEMON_IS_DOWN";
    exitStatuses[exitStatuses["ERR_SUB_ALREADY_STARTED"] = 2] = "ERR_SUB_ALREADY_STARTED";
})(exitStatuses || (exitStatuses = {}));
