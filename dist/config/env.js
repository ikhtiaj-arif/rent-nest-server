"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string({
        required_error: "DATABASE_URL is required",
    }).min(1, "DATABASE_URL cannot be empty"),
    JWT_SECRET: zod_1.z.string({
        required_error: "JWT_SECRET is required",
    }).min(1, "JWT_SECRET cannot be empty"),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
    PORT: zod_1.z.coerce.number().default(5000),
    STRIPE_SECRET_KEY: zod_1.z.string({
        required_error: "STRIPE_SECRET_KEY is required",
    }).min(1, "STRIPE_SECRET_KEY cannot be empty"),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string({
        required_error: "STRIPE_WEBHOOK_SECRET is required",
    }).min(1, "STRIPE_WEBHOOK_SECRET cannot be empty"),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Environment validation failed:");
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    process.exit(1);
}
exports.env = parsed.data;
