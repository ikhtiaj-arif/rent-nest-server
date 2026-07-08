import { Router } from "express";
import { Role } from "generated/prisma/enums";
import { auth } from "src/middleware/auth";
import { paymentController } from "./payments.controller";

const router = Router();


//  only Authenticated tenant creates a PaymentIntent for their approved rental
router.post("/create", auth(Role.TENANT), paymentController.createPayment);


export const paymentRoutes = router;