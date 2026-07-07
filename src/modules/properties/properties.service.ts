// Properties Service placeholder

import { PropertyWhereInput } from "generated/prisma/models";
import { prisma } from "src/lib/prisma";
import { IPropertyPayload, IPropertyQuery } from "./properties.interface";

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
    return property;
  });
  return result;
};

const getAllProperties = async (query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: PropertyWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (query.title) {
    andConditions.push({ title: query.title });
  }
  if (query.city) {
    andConditions.push({ city: query.city });
  }
  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  // Category (Type)
  if (query.type) {
    andConditions.push({
      category: {
        name: {
          equals: query.type,
          mode: "insensitive",
        },
      },
    });
  }

  const result = await prisma.property.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          // role: true,
        },
      },
    },
  });

  return result;
};
const getPropertyById = async (propertyId: string) => {
  const result = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      category: true,
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          // role: true,
        },
      },
      reviews: true,
      rentalRequests: true,
    },
  });

  if (!result) {
    throw new Error("Property not found");
  }

  return result;
};
const getPropertyCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateProperty = async (
  propertyId: string,
  payload: Partial<IPropertyPayload>,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }
  const result = await prisma.$transaction(async (tx) => {
    let categoryId = property.categoryId;

    // Update category if categoryName is provided
    if (payload.categoryName || payload.categoryDescription) {
      // Get the property's current category
      const currentCategory = await tx.category.findUnique({
        where: {
          id: property.categoryId,
        },
      });

      if (!currentCategory) {
        throw new Error("Category not found");
      }

      const category = await tx.category.upsert({
        where: {
          name: payload.categoryName ?? currentCategory.name,
        },
        update: {
          description:
            payload.categoryDescription ?? currentCategory.description,
        },
        create: {
          name: payload.categoryName ?? currentCategory.name,
          description:
            payload.categoryDescription ?? currentCategory.description,
        },
      });

      categoryId = category.id;
    }

    const updatedProperty = await tx.property.update({
      where: {
        id: propertyId,
      },
      data: {
        title: payload.title,
        city: payload.city,
        price: payload.price,
        categoryId,
      },
      include: {
        category: true,
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    return updatedProperty;
  });

  return result;
};
const deleteProperty = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });

  return null;
};

export const propertiesService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  updateProperty,
  deleteProperty,
};
