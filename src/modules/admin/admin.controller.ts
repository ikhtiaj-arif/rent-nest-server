// Admin Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "src/utils/catchAsync";
import { sendResponse } from "src/utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsers();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: result,
    });
  },
);
const updateUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.updateUserById();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User updated successfully",
      data: result,
    });
  },
);
export const adminController = {
  getAllUsers,
  updateUserById,
};
