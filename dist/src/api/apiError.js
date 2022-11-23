export class ApiError extends Error {
    constructor(statusMessage, statusCode) {
        super(statusMessage);
        this.statusMessage = statusMessage;
        this.statusCode = statusCode;
    }
}
