import { ApiError } from "./apiError.js";
export declare class ApiResponse extends ApiError {
    res: any;
    constructor(statusMessage: string, statusCode: number, res: any);
}
