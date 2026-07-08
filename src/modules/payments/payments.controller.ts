// Payments Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "src/config";
import { catchAsync } from "src/utils/catchAsync";
import { sendResponse } from "src/utils/sendResponse";
import { paymentService } from "./payments.service";


const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user!.id;
    const result = await paymentService.createPayment(req.body, tenantId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment intent created successfully",
      data: result,
    });
  },
);



export const paymentController = {
  createPayment,
 
};
