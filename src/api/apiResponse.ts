import { ApiError } from "./apiError.js";

// Since tsoa does not allow us to change status text in controllers, we will throw a skeleton error with response info and have middleware catch it
export class ApiResponse extends ApiError {
    res: any;
    constructor(statusMessage: string, statusCode: number, res: any) {
        super(statusMessage, statusCode);
        this.res = res;
    }
}
