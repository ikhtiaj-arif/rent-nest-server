import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

// Wraps a Zod schema as Express middleware. Validates req.body against
// the schema before the route's controller runs. On failure, throws the
// ZodError to the global error handler, which formats it into the
// { success: false, message, errors: { field: [messages] } } shape.
export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
