"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errorDetails;
    success;
    constructor(statusCode, message, errorDetails = null, stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.errorDetails = errorDetails;
        this.success = false;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
