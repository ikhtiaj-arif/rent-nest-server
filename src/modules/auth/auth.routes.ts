import { Router } from "express";
 
import { authController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

// Auth Routes placeholder
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get(
  "/me",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  authController.getUserProfile,
);

export const authRoutes = router;
