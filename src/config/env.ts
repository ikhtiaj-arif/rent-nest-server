import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string({
    required_error: "DATABASE_URL is required",
  }).min(1, "DATABASE_URL cannot be empty"),
  JWT_SECRET: z.string({
    required_error: "JWT_SECRET is required",
  }).min(1, "JWT_SECRET cannot be empty"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(5000),
  STRIPE_SECRET_KEY: z.string({
    required_error: "STRIPE_SECRET_KEY is required",
  }).min(1, "STRIPE_SECRET_KEY cannot be empty"),
  STRIPE_WEBHOOK_SECRET: z.string({
    required_error: "STRIPE_WEBHOOK_SECRET is required",
  }).min(1, "STRIPE_WEBHOOK_SECRET cannot be empty"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment validation failed:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
