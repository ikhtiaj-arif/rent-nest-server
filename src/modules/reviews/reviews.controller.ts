// Reviews Controller placeholder
// Rentals Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
 
import { reviewService } from "./reviews.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const result = await reviewService.createReview(req.body, tenantId!);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Review Created successfully",
      data: result,
    });
  },
);
export const reviewController = {
  createReview,
};
