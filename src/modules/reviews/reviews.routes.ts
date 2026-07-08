import { Router } from "express";
import { Role } from "generated/prisma/enums";
import { auth } from "src/middleware/auth";
import { reviewController } from "./reviews.controller";

// Reviews Routes placeholder
const router = Router();
router.post("/", auth(Role.TENANT), reviewController.createReview);
export const reviewRoutes = router;
