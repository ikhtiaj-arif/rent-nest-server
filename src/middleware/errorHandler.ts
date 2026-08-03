import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode;
  let errorMessage = "Something went wrong! Please try again later.";
  let errorName = "InternalServerError";
  let errorDetails: unknown = null;

  if (err instanceof Error) {
    errorMessage = err.message;
    errorName = err.name;
  }

  console.error(err);

  if (err instanceof ZodError) {
    // Reshape Zod's issue list into { fieldName: ["message", ...] },
    // matching the error response format documented in the README.
    statusCode = httpStatus.BAD_REQUEST;
    errorName = "ValidationError";
    // The frontend currently only surfaces the top-level `message` in its
    // toasts (it doesn't yet read `errorDetails` for inline field errors),
    // so lead with the first field's actual message rather than a generic
    // "Validation failed" — that's the difference between a useful toast
    // and a useless one until inline field errors are wired up client-side.
    errorMessage = err.issues[0]?.message ?? "Validation failed";
    errorDetails = err.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const field = issue.path.join(".") || "root";
      acc[field] = [...(acc[field] ?? []), issue.message];
      return acc;
    }, {});
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorName = "PrismaValidationError";
    errorMessage =
      "Invalid data provided. Please check your request and try again.";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
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
    stack:
      process.env.NODE_ENV === "development"
        ? err instanceof Error
          ? err.stack
          : undefined
        : undefined,
  });
};
