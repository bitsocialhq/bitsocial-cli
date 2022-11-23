export declare class ApiError extends Error {
    statusCode: number;
    statusMessage: string;
    constructor(statusMessage: string, statusCode: number);
}
