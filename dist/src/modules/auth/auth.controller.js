import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
// Auth Controller placeholder
const register = catchAsync(async (req, res, next) => {
    const payload = req.body;
    const result = await authService.registerDB(payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User registered successfully",
        //   data: { accessToken, refreshToken },
        data: result,
    });
});
const login = catchAsync(async (req, res, next) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await authService.loginUser(payload);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: { accessToken, refreshToken },
    });
});
// const refreshToken = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {},
// );
const getUserProfile = catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const profile = await authService.getUserProfile(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile retrieved successfully",
        data: { profile },
    });
});
export const authController = {
    register,
    login,
    getUserProfile,
};
//# sourceMappingURL=auth.controller.js.map