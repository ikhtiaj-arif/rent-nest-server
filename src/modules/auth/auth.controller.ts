import { NextFunction, Request, Response } from "express";
import { catchAsync } from "src/utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "src/utils/sendResponse";
import httpStatus from "http-status";

// Auth Controller placeholder
const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.registerDB();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User registered successfully",
      //   data: { accessToken, refreshToken },
      data: result,
    });
  },
);
const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.loginDB();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      //   data: { accessToken, refreshToken },
      data: result,
    });
  },
);
// const refreshToken = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {},
// );

const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.getUserProfile();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: result,
    });
  },
);

export const authController = {
  register,
  login,
  getUserProfile,
};
