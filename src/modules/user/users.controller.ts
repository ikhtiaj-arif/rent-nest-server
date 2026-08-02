import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./users.service";

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    const result = await userService.getMe(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: result,
    });
  },
);

const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    const result = await userService.updateMe(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: result,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    await userService.changePassword(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password changed successfully",
      data: null,
    });
  },
);

const requestLandlord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    const result = await userService.requestLandlord(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Landlord request submitted successfully",
      data: result,
    });
  },
);

const getLandlordRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    const result = await userService.getLandlordRequest(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Landlord request retrieved successfully",
      data: result,
    });
  },
);
const changeProfilePicture = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user!;
      const files = (req.files as Express.Multer.File[]) ?? [];

    const result = await userService.updateProfilePicture(id,files);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Landlord request retrieved successfully",
      data: result,
    });
  },
);
 
export const userController = {
  getMe,
  updateMe,
  changePassword,
  requestLandlord,
  getLandlordRequest,changeProfilePicture
};