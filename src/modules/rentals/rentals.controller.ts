// Rentals Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "src/utils/catchAsync";
import { sendResponse } from "src/utils/sendResponse";
import { rentalService } from "./rentals.service";

const createRental = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.createRentals();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental Created successfully",
      data: result,
    });
  },
);
const getAllRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.getRentals();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rentals retrieved successfully",
      data: result,
    });
  },
);
const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.getRentals();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rentals retrieved successfully",
      data: result,
    });
  },
);
const getRentalById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.getRentalsById();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental retrieved successfully",
      data: result,
    });
  },
);

const getPendingRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.getPendingRentals();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Landlord all Rental requests retrieved successfully",
      data: result,
    });
  },
);
const approveRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rentalService.approveRentalRequest();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request approved successfully",
      data: result,
    });
  },
);

export const rentalController = {
  createRental,
  getAllRentals,
  getRentalById,
  getPendingRentals,
  approveRentalRequest,
  getAllRentalRequests,
};
