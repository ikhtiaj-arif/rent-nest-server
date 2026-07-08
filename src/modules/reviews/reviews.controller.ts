// Reviews Controller placeholder
// Rentals Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "src/utils/catchAsync";
import { sendResponse } from "src/utils/sendResponse";
import { reviewService } from "./reviews.service";

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
