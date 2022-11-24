"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
const apiError_js_1 = require("./apiError.js");
// Since tsoa does not allow us to change status text in controllers, we will throw a skeleton error with response info and have middleware catch it
class ApiResponse extends apiError_js_1.ApiError {
    constructor(statusMessage, statusCode, res) {
        super(statusMessage, statusCode);
        this.res = res;
    }
}
exports.ApiResponse = ApiResponse;
