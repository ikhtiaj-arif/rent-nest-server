import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
export const globalErrorHandler = (err, req, res, next) => {
    let statusCode;
    let errorMessage = "Something went wrong! Please try again later.";
    let errorName = "InternalServerError";
    let errorDetails = null;
    if (err instanceof Error) {
        errorMessage = err.message;
        errorName = err.name;
    }
    console.error(err);
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorName = "PrismaValidationError";
        errorMessage =
            "Invalid data provided. Please check your request and try again.";
    }
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        errorName = "PrismaKnownRequestError";
        errorDetails = err.meta;
        switch (err.code) {
            case "P2002":
                statusCode = httpStatus.CONFLICT;
                errorMessage = "Duplicate entry. The record already exists.";
                break;
            case "P2003":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "Foreign key constraint failed.";
                break;
            case "P2025":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "Requested resource was not found.";
                break;
            default:
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = err.message;
        }
    }
    res.status(statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        name: errorName,
        message: errorMessage,
        errorDetails,
        stack: process.env.NODE_ENV === "development"
            ? err instanceof Error
                ? err.stack
                : undefined
            : undefined,
    });
};
//# sourceMappingURL=errorHandler.js.map