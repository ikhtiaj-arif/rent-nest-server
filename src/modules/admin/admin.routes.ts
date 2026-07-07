// Admin Routes placeholder
import { Router } from "express";
import { auth } from "src/middleware/auth";
import { propertiesController } from "../properties/properties.controller";
import { rentalController } from "../rentals/rentals.controller";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", auth("ADMIN"), adminController.getAllUsers);
router.patch("/users/:id", auth("ADMIN"), adminController.updateUserById);
router.get("/properties", auth("ADMIN"), propertiesController.getAllProperties);
router.get("/rentals", auth("ADMIN"), rentalController.getAllRentals);

export const adminRoutes = router;
