"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("./middleware/error.middleware");
const ApiError_1 = require("./utils/ApiError");
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Root Route
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to RentNest API",
        version: "1.0.0",
    });
});
// Handle 404 (Route not found)
app.use((req, _res, next) => {
    next(new ApiError_1.ApiError(404, `Route ${req.originalUrl} not found`));
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
