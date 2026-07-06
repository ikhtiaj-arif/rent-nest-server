import { Router } from "express";
import { reviewController } from "./reviews.controller";

// Reviews Routes placeholder
const router = Router();

router.post("/", reviewController.createReview);
export const reviewRoutes = router;
