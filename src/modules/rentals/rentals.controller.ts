// Rentals Controller placeholder
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "src/utils/catchAsync";
import { sendResponse } from "src/utils/sendResponse";
import { rentalService } from "./rentals.service";
import { RentalStatus } from "generated/prisma/enums";

const createRental = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?.id!;
    const result = await rentalService.createRentals(req.body, userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requested successfully",
      data: result,
    });
  },
);
const getAllRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const userId = req.user?.id!;
    // const result = await rentalService.getRentals(userId);
    // sendResponse(res, {
    //   success: true,
    //   statusCode: httpStatus.OK,
    //   message: "All rentals retrieved successfully",
    //   data: result,
    // });
  },
);
const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;
    const result = "await rentalService.getPendingRentals(userId)";
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
    const { id } = req.params!;
    const result = await rentalService.getRentalsById(id!);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental retrieved successfully",
      data: result,
    });
  },
);

const getUserRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;
    const result = await rentalService.getUserRentalRequestsDB(userId);
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

const getRentalsOnPropertyForLandlord = catchAsync(async (req, res) => {
  const landlordId = req.user?.id;
  const { status } = req.query;

  const result = await rentalService.getRentalsOnPropertyForLandlord(
    landlordId!,
    status as RentalStatus | undefined,
  );

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
  getRentalsOnPropertyForLandlord
};
