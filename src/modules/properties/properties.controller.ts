import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "src/utils/catchAsync";
import { sendResponse } from "src/utils/sendResponse";
import { propertiesService } from "./properties.service";

const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await propertiesService.getAllProperties(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All properties retrieved successfully",
      data: result,
    });
  },
);

const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await propertiesService.getPropertyById(id!);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property retrieved successfully",
      data: result,
    });
  },
);

const getPropertyCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertiesService.getPropertyCategories();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property categories retrieved successfully",
      data: result,
    });
  },
);

const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?.id!;
    const result = await propertiesService.createProperty(req.body, userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Property listing created successfully",
      data: result,
    });
  },
);

const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const propertyId = req.params.id!;
    const result = await propertiesService.updateProperty(propertyId, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property listing updated successfully",
      data: result,
    });
  },
);

const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertiesService.deleteProperty(req.params.id!);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property listing removed successfully",
      data: result,
    });
  },
);

export const propertiesController = {
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  createProperty,
  updateProperty,
  deleteProperty,
};
