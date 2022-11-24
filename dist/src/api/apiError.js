"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusMessage, statusCode) {
        super(statusMessage);
        this.statusMessage = statusMessage;
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
