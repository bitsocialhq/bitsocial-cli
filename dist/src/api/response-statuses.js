export var statusMessages;
(function (statusMessages) {
    statusMessages["ERR_INVALID_JSON_FOR_REQUEST_BODY"] = "Request body is invalid as a JSON";
    statusMessages["ERR_SUBPLEBBIT_DOES_NOT_EXIST"] = "Subplebbit does not exist";
    statusMessages["ERR_SUB_ALREADY_STARTED"] = "Subplebbit is already started";
    statusMessages["ERR_SUBPLEBBIT_NOT_RUNNING"] = "Subplebbit is not running";
    // Success
    statusMessages["SUCCESS_SUBPLEBBIT_CREATED"] = "Subplebbit created";
    statusMessages["SUCCESS_SUBPLEBBIT_STARTED"] = "Subplebbit started";
    statusMessages["SUCCESS_SUBPLEBBIT_STOPPED"] = "Subplebbit stopped";
    statusMessages["SUCCESS_SUBPLEBBIT_EDITED"] = "Subplebbit edited";
})(statusMessages || (statusMessages = {}));
export const statusMessageKeys = Object.assign({}, ...Object.keys(statusMessages).map((key) => ({ [key]: key })));
export var statusCodes;
(function (statusCodes) {
    statusCodes[statusCodes["ERR_INVALID_JSON_FOR_REQUEST_BODY"] = 400] = "ERR_INVALID_JSON_FOR_REQUEST_BODY";
    statusCodes[statusCodes["ERR_SUB_ALREADY_STARTED"] = 409] = "ERR_SUB_ALREADY_STARTED";
    statusCodes[statusCodes["ERR_SUBPLEBBIT_DOES_NOT_EXIST"] = 404] = "ERR_SUBPLEBBIT_DOES_NOT_EXIST";
    statusCodes[statusCodes["ERR_SUBPLEBBIT_NOT_RUNNING"] = 409] = "ERR_SUBPLEBBIT_NOT_RUNNING";
    // Success
    statusCodes[statusCodes["SUCCESS_SUBPLEBBIT_CREATED"] = 201] = "SUCCESS_SUBPLEBBIT_CREATED";
    statusCodes[statusCodes["SUCCESS_SUBPLEBBIT_STARTED"] = 200] = "SUCCESS_SUBPLEBBIT_STARTED";
    statusCodes[statusCodes["SUCCESS_SUBPLEBBIT_STOPPED"] = 200] = "SUCCESS_SUBPLEBBIT_STOPPED";
    statusCodes[statusCodes["SUCCESS_SUBPLEBBIT_EDITED"] = 200] = "SUCCESS_SUBPLEBBIT_EDITED";
})(statusCodes || (statusCodes = {}));
