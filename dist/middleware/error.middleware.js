"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const errorDetails = err.errorDetails || null;
    res.status(statusCode).json({
        success: false,
        message,
        errorDetails,
    });
};
exports.errorHandler = errorHandler;
