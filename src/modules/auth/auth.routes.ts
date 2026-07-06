import { Router } from "express";
import { authController } from "./auth.controller";

// Auth Routes placeholder
const router = Router()

router.post("/register", authController.register )
router.post("/login", authController.login )
router.get("/me", authController.getUserProfile )

export const authRoutes = router