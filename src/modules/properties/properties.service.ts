// Properties Service placeholder

import { prisma } from "src/lib/prisma";
import { IPropertyPayload } from "./properties.interface";

const createProperty = async (payload: IPropertyPayload, userId: string) => {
  const { title, city, price, categoryName, categoryDescription } = payload;

  const landlordId = userId;

  const result = await prisma.$transaction(async (tx) => {
    //? transaction-1: upsert category
    const category = await tx.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        description: categoryDescription,
      },
    });
    //? transaction-2: create property with the id of category
    const property = await tx.property.create({
      data: {
        title,
        city,
        price,
        landlordId,
        categoryId: category.id,
      },
      include: { category: true },
    });
    return property
  });
  return result
};

const getAllProperties = async () => {
  return "All properties retrieved successfully";
};
const getPropertyById = async () => {
  return "Property retrieved successfully";
};
const getPropertyCategories = async () => {
  return "Property categories retrieved successfully";
};

const updateProperty = async () => {
  return "Property updated successfully";
};
const deleteProperty = async () => {
  return "Property updated successfully";
};

export const propertiesService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  updateProperty,
  deleteProperty,
};
