import httpStatus from "http-status";
import { rentalService } from "./rentals.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
const createRental = catchAsync(async (req, res, next) => {
    const userId = req?.user?.id;
    const result = await rentalService.createRentals(req.body, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requested successfully",
        data: result,
    });
});
const getAllRentals = catchAsync(async (req, res, next) => {
    const query = req.query;
    const result = await rentalService.getAllRentals(query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All rentals retrieved successfully",
        data: result,
    });
});
const getAllRentalRequests = catchAsync(async (req, res, next) => {
    const userId = req.user?.id;
    const result = "await rentalService.getPendingRentals(userId)";
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All rentals retrieved successfully",
        data: result,
    });
});
const getRentalById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const result = await rentalService.getRentalsById(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental retrieved successfully",
        data: result,
    });
});
const getUserRentalRequests = catchAsync(async (req, res, next) => {
    const userId = req.user?.id;
    const result = await rentalService.getUserRentalRequestsDB(userId, req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Landlord all Rental requests retrieved successfully",
        data: result,
    });
});
const approveRentalRequest = catchAsync(async (req, res, next) => {
    const rentalRequestId = req.params.id;
    const landlordId = req.user?.id;
    const status = req.body.status;
    const result = await rentalService.approveRentalRequest(rentalRequestId, landlordId, status);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request approved successfully",
        data: result,
    });
});
const getRentalsOnPropertyForLandlord = catchAsync(async (req, res) => {
    const landlordId = req.user?.id;
    const { status } = req.query;
    const result = await rentalService.getRentalsOnPropertyForLandlord(landlordId, req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result,
    });
});
export const rentalController = {
    createRental,
    getAllRentals,
    getRentalById,
    getUserRentalRequests,
    approveRentalRequest,
    getAllRentalRequests,
    getRentalsOnPropertyForLandlord,
};
//# sourceMappingURL=rentals.controller.js.map