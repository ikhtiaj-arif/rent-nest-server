import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";


const app = express();

// Global Middlewares

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to RentNest API",
    version: "1.0.0",
  });
});

// Handle 404 (Route not found)
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
