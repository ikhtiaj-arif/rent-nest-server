import { Router } from "express";
import { rentalController } from "./rentals.controller";

// Rentals Routes placeholder
const router = Router();

router.post("/", rentalController.createRental);
// it will get current users rental requests
router.get("/", rentalController.getAllRentalRequests);
router.get("/:id", rentalController.getRentalById);
