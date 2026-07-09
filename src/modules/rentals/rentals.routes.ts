import { Router } from "express";
 
import { rentalController } from "./rentals.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

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
