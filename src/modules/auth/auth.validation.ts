import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().optional(),
  // Public registration may only self-assign TENANT or LANDLORD —
  // ADMIN is deliberately not part of this enum, so it's rejected
  // by Zod before it ever reaches the service layer.
  role: z.enum(["TENANT", "LANDLORD"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
