import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { propertiesController } from "../properties/properties.controller";
import { rentalController } from "../rentals/rentals.controller";

const router = Router();

router.post(
  "/properties",
  auth(Role.LANDLORD, Role.ADMIN),
  upload.array("images", 5),
  propertiesController.createProperty,
);
router.put("/properties/:id",  auth(Role.LANDLORD, Role.ADMIN), propertiesController.updateProperty);
router.delete("/properties/:id",  auth(Role.LANDLORD, Role.ADMIN), propertiesController.deleteProperty);
router.get(
  "/properties",
  auth(Role.LANDLORD, Role.ADMIN),
  propertiesController.getOwnProperties,
);
router.get(
  "/requests",
  auth(Role.LANDLORD, Role.ADMIN),
  rentalController.getRentalsOnPropertyForLandlord,
);
router.patch(
  "/requests/:id",
  auth(Role.LANDLORD),
  rentalController.approveRentalRequest,
);

export const landlordRoutes = router;
