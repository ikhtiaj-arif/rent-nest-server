import { Router } from "express";
 
import { reviewController } from "./reviews.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

// Reviews Routes placeholder
const router = Router();
router.post("/", auth(Role.TENANT), reviewController.createReview);
export const reviewRoutes = router;
