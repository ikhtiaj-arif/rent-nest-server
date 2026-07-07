import { Router } from "express";
import { Role } from "generated/prisma/enums";
import { auth } from "src/middleware/auth";
import { rentalController } from "./rentals.controller";

// Rentals Routes placeholder
const router = Router();

router.post("/", auth(Role.TENANT, Role.ADMIN), rentalController.createRental);
// it will get current users rental requests
router.get(
  "/",
  auth(Role.TENANT, Role.ADMIN),
  rentalController.getUserRentalRequests,
);
router.get("/:id", rentalController.getRentalById);

export const rentalRoutes = router;
