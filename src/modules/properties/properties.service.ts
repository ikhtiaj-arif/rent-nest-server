// Properties Service placeholder

import { PropertyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ImageService } from "../image/image.service";
import { IPropertyPayload, IPropertyQuery } from "./properties.interface";

const createProperty = async (
  payload: IPropertyPayload,
  files: Express.Multer.File[],
  userId: string,
) => {
  const {
    title,
    city,
    price,
    area,
    bedrooms,
    bathrooms,
    address,
    description,
    categoryName,
    categoryDescription,
    availableFrom,
    furnished,
  } = payload;
  const isFurnished = furnished === "true";

  const landlordId = userId;

  const uploadedImages =
    files?.length > 0
      ? await ImageService.uploadMultipleImages(files, {
          folder: "properties",
        })
      : [];

  // console.log("upload image", uploadedImages);

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
        price: Number(price),
        area: Number(area),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        address,
        description,
        availableFrom,
        furnished: isFurnished,
        landlordId,
        categoryId: category.id,
      },
      include: { category: true },
    });
    //? transaction-3: create property images
    if (uploadedImages.length) {
      await tx.propertyImage.createMany({
        data: uploadedImages.map((image, index) => ({
          propertyId: property.id,
          url: image.url,
          storageKey: image.storageKey,
          width: image.width,
          height: image.height,
          fileSize: image.fileSize,
          mimeType: image.mimeType,
          displayOrder: index,
          isPrimary: index === 0,
        })),
      });
    }
    return tx.property.findUnique({
      where: {
        id: property.id,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  });
  return result;
};

// Maps the combined `sort` query param the client sends (e.g. "price_asc")
// to a concrete { sortBy, sortOrder } pair. Falls back to explicit
// sortBy/sortOrder query params, then to createdAt desc.
const SORT_MAP: Record<string, { sortBy: string; sortOrder: "asc" | "desc" }> =
  {
    newest: { sortBy: "createdAt", sortOrder: "desc" },
    oldest: { sortBy: "createdAt", sortOrder: "asc" },
    price_asc: { sortBy: "price", sortOrder: "asc" },
    price_desc: { sortBy: "price", sortOrder: "desc" },
    rating_desc: { sortBy: "createdAt", sortOrder: "desc" },
  };

const resolveSort = (query: IPropertyQuery) => {
  const mapped = query.sort ? SORT_MAP[query.sort] : undefined;

  if (mapped) {
    return mapped;
  }

  return {
    sortBy: query.sortBy || "createdAt",
    sortOrder: (query.sortOrder as "asc" | "desc") || "desc",
  };
};

const getAllProperties = async (query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const { sortBy, sortOrder } = resolveSort(query);

  const andConditions: PropertyWhereInput[] = [];

  // Search
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
        {
          landlord: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          landlord: {
            email: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Title
  if (query.title) {
    andConditions.push({
      title: {
        contains: query.title,
        mode: "insensitive",
      },
    });
  }

  // City
  if (query.city) {
    andConditions.push({
      city: {
        equals: query.city,
        mode: "insensitive",
      },
    });
  }

  // Price Range
  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  // Category (by id — this is what the properties filter UI sends)
  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  // Category (legacy filter by name, kept for backwards compatibility)
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

  // Availability
  if (query.isAvailable !== undefined) {
    andConditions.push({
      isAvailable: query.isAvailable === "true",
    });
  }

  // Landlord
  if (query.landlordId) {
    andConditions.push({
      landlordId: query.landlordId,
    });
  }

  const where: PropertyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
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
          },
        },
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
        _count: {
          select: {
            rentalRequests: true,
            reviews: true,
          },
        },
        reviews: true,
        rentalRequests: true,
      },
    }),

    prisma.property.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: properties,
  };
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
      images: {
        orderBy: {
          displayOrder: "asc",
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

const updateProperty = async (
  propertyId: string,
  payload: Partial<IPropertyPayload>,
) => {
  console.log("payload", payload);
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
    const isFurnished = payload.furnished === "true";
    const updatedProperty = await tx.property.update({
      where: {
        id: propertyId,
      },
      data: {
        title: payload.title,
        description: payload.description,
        city: payload.city,
        address: payload.address,
        price: payload.price,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        area: payload.area,
        availableFrom: payload.availableFrom,
        furnished: isFurnished,
        isAvailable: payload.isAvailable,
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

const getPropertyCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getPropertiesFilterOptions = async () => {
  const [categories, cities] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.property.findMany({
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    }),
  ]);

  return {
    categories,
    cities: cities.map((item) => item.city),
  };
};

const getOwnProperties = async (query: IPropertyQuery, ownerId: string) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const { sortBy, sortOrder } = resolveSort(query);

  const andConditions: PropertyWhereInput[] = [
    {
      landlordId: ownerId,
    },
  ];

  // Search
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
        {
          landlord: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          landlord: {
            email: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Title
  if (query.title) {
    andConditions.push({
      title: {
        contains: query.title,
        mode: "insensitive",
      },
    });
  }

  // City
  if (query.city) {
    andConditions.push({
      city: {
        equals: query.city,
        mode: "insensitive",
      },
    });
  }

  // Price Range
  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  // Category (by id — this is what the properties filter UI sends)
  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  // Category (legacy filter by name, kept for backwards compatibility)
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

  // Availability
  if (query.isAvailable !== undefined) {
    andConditions.push({
      isAvailable: query.isAvailable === "true",
    });
  }

  const where: PropertyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
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
          },
        },
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },

        _count: {
          select: {
            rentalRequests: true,
            reviews: true,
          },
        },
      },
    }),

    prisma.property.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: properties,
  };
};

export const propertiesService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertyCategories,
  updateProperty,
  deleteProperty,
  getPropertiesFilterOptions,
  getOwnProperties,
};
