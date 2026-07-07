import { Router } from "express";
import { propertiesController } from "./properties.controller";
import { rentalController } from "../rentals/rentals.controller";

// Properties Routes placeholder
const router = Router();

router.get("/", propertiesController.getAllProperties);
router.get("/properties", propertiesController.getAllProperties);
router.get("/rentals", rentalController.getAllRentals);
router.get("/:id", propertiesController.getPropertyById);
// router.patch("/:id", propertiesController.getPropertyById);


export const propertyRoutes = router
