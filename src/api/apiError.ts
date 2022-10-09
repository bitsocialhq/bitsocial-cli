export class ApiError extends Error {
    statusCode: number;
    statusMessage: string;
    constructor(statusMessage: string, statusCode: number) {
        super(statusMessage);
        this.statusMessage = statusMessage;
        this.statusCode = statusCode;
    }
}
