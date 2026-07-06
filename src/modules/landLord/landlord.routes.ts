import { Router } from "express";
import { Role } from "generated/prisma/enums";
import { auth } from "src/middleware/auth";
import { propertiesController } from "../properties/properties.controller";
import { rentalController } from "../rentals/rentals.controller";

const router = Router();

router.post(
  "/properties",
  auth(Role.LANDLORD, Role.ADMIN),
  propertiesController.createProperty,
);
router.put("/properties/:id", propertiesController.updateProperty);
router.delete("/properties/:id", propertiesController.deleteProperty);
router.get("/requests", rentalController.getPendingRentals);
router.patch("/requests/:id", rentalController.approveRentalRequest);

export const landlordRoutes = router;
