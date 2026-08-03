import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
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
router.get(
  "/:id",
  auth(Role.TENANT, Role.ADMIN),
  rentalController.getRentalById,
);

// Tenant cancels pending rental request
router.patch(
  "/:id/cancel",
  auth(Role.TENANT),
  rentalController.cancelRentalRequest,
);

// Tenant or Landlord ends an active rental
router.patch(
  "/:id/end",
  auth(Role.TENANT, Role.LANDLORD),
  rentalController.endRental,
);

export const rentalRoutes = router;
