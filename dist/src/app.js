import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import config from "./config";
import { globalErrorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { authRoutes } from "./modules/auth/auth.routes";
import { categoryRoutes } from "./modules/categories/categories.service";
import { adminRoutes } from "./modules/admin/admin.routes";
import { landlordRoutes } from "./modules/landLord/landlord.routes";
import { propertyRoutes } from "./modules/properties/properties.routes";
import { reviewRoutes } from "./modules/reviews/reviews.routes";
import { rentalRoutes } from "./modules/rentals/rentals.routes";
import { paymentRoutes } from "./modules/payments/payments.routes";
const app = express();
app.use((req, res, next) => {
    console.log(req.method, req.originalUrl);
    next();
});
app.use(cors({
    origin: config.app_url,
    credentials: true,
}));
//  WEBHOOK ROUTE — must come BEFORE express.json()
app.use("/api/payments/confirm", express.raw({ type: "application/json" }));
// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Root Route
app.get("/", (_req, res) => {
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
app.use("/api/rentals", rentalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
// Handle 404 (Route not found)
app.use(notFound);
// Global Error Handler
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map