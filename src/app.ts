import cors from "cors";
import express, { Application, Request, Response } from "express";

import config from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { authRoutes } from "./modules/auth/auth.routes";
import { categoryRoutes } from "./modules/categories/categories.service";

import { adminRoutes } from "./modules/admin/admin.routes";
import { landlordRoutes } from "./modules/landLord/landlord.routes";
import { propertyRoutes } from "./modules/properties/properties.routes";
import { reviewRoutes } from "./modules/reviews/reviews.routes";

const app: Application = express();

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

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

//app routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

// Handle 404 (Route not found)
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
