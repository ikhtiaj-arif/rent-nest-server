import { Router } from "express";
 
import { paymentController } from "./payments.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


//  only Authenticated tenant creates a PaymentIntent for their approved rental
router.post("/create", auth(Role.TENANT), paymentController.createPayment);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(Role.TENANT, Role.ADMIN), paymentController.getPayments);

router.get("/:id", auth(Role.TENANT, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;