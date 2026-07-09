// Payments Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
 
import { paymentService } from "./payments.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import config from "../../config";

const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const result = await paymentService.createPayment(req.body, tenantId!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment intent created successfully",
      data: result,
    });
  },
);

const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Stripe sends the signature in this header used to verify authenticity
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      throw new Error("Missing Stripe signature header");
    }

    //! req.body here is a raw Buffer (because of express.raw() in app.ts)
    const result = await paymentService.handleStripeWebhook(
      event,
      signature,
      config.stripe_webhook_secret,
    );

    //! Always respond 200 to Stripe — non-2xx causes Stripe to retry the webhook
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook received",
      data: result,
    });
  },
);
const getPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user!.id;
    const role = req.user!.role;
    const result = await paymentService.getUserPayments(
      tenantId,
      role,
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const tenantId = req.user!.id;
    const role = req.user!.role;

    const result = await paymentService.getPaymentById(id!, tenantId, role);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment retrieved successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createPayment,
  confirmPayment,
  getPayments,
  getPaymentById,
};
