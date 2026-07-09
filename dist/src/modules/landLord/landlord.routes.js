import { Router } from "express";
import { propertiesController } from "../properties/properties.controller";
import { rentalController } from "../rentals/rentals.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
const router = Router();
router.post("/properties", auth(Role.LANDLORD, Role.ADMIN), propertiesController.createProperty);
router.put("/properties/:id", propertiesController.updateProperty);
router.delete("/properties/:id", propertiesController.deleteProperty);
router.get("/requests", rentalController.getRentalsOnPropertyForLandlord);
router.patch("/requests/:id", auth(Role.LANDLORD), rentalController.approveRentalRequest);
export const landlordRoutes = router;
//# sourceMappingURL=landlord.routes.js.map