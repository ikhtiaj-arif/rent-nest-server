// Admin Routes placeholder
import { Router } from "express";
import { propertiesController } from "../properties/properties.controller";
import { rentalController } from "../rentals/rentals.controller";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id", adminController.updateUserById);
router.get("/properties", propertiesController.getAllProperties);
router.get("/rentals", rentalController.getAllRentalRequests);

export const adminRoutes = router;
