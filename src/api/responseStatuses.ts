export enum statusMessages {
    ERR_INVALID_JSON_FOR_REQUEST_BODY = "Request body is invalid as a JSON",
    ERR_SUBPLEBBIT_DOES_NOT_EXIST = "Subplebbit does not exist",
    ERR_SUB_ALREADY_STARTED = "Subplebbit is already started",
    ERR_SUBPLEBBIT_NOT_RUNNING = "Subplebbit is not running",

    // Success
    SUCCESS_SUBPLEBBIT_CREATED = "Subplebbit created",
    SUCCESS_SUBPLEBBIT_STARTED = "Subplebbit started",
    SUCCESS_SUBPLEBBIT_STOPPED = "Subplebbit stopped",
    SUCCESS_SUBPLEBBIT_EDITED = "Subplebbit edited"
}

export enum statusCodes {
    ERR_INVALID_JSON_FOR_REQUEST_BODY = 400,
    ERR_SUB_ALREADY_STARTED = 409,
    ERR_SUBPLEBBIT_DOES_NOT_EXIST = 404,
    ERR_SUBPLEBBIT_NOT_RUNNING = 409,

    // Success
    SUCCESS_SUBPLEBBIT_CREATED = 201,
    SUCCESS_SUBPLEBBIT_STARTED = 200,
    SUCCESS_SUBPLEBBIT_STOPPED = 200,
    SUCCESS_SUBPLEBBIT_EDITED = 200
}
