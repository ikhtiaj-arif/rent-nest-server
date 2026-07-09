import httpStatus from "http-status";
import { adminService } from "./admin.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
const getAllUsers = catchAsync(async (req, res, next) => {
    const result = await adminService.getAllUsers(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: result,
    });
});
const updateUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await adminService.updateUserById(id, payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        data: result,
    });
});
export const adminController = {
    getAllUsers,
    updateUserById,
};
//# sourceMappingURL=admin.controller.js.map