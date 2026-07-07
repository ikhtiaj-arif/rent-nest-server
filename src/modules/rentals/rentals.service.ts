import { RentalStatus } from "generated/prisma/enums";
import { RentalRequestWhereInput } from "generated/prisma/models";
import { prisma } from "src/lib/prisma";
import { ICreateRentalPayload, IRentalQuery } from "./rental.interface";



const createRentals = async (
  payload: ICreateRentalPayload,
  tenantId: string,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: payload.propertyId,
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  if (!property.isAvailable) {
    throw new Error("Property is not available for rent");
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: RentalStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new Error("You already have a pending request for this property");
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
    },
    include: {
      property: true,
    },
  });
};
const getRentalsOnPropertyForLandlord = async (
  landlordId: string,
  status?: RentalStatus,
) => {
  const whereCondition: RentalRequestWhereInput = {
    property: {
      landlordId,
    },
  };

  if (status) {
    const normalizedStatus = status.toUpperCase() as RentalStatus;

    if (!Object.values(RentalStatus).includes(normalizedStatus)) {
      throw new Error("Invalid rental status");
    }

    whereCondition.status = normalizedStatus;
  }

  const result = await prisma.rentalRequest.findMany({
    where: whereCondition,
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      property: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getRentalsById = async (rentalId: string) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      property: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!rental) {
    throw new Error("Rental request not found");
  }

  return rental;
};

const getUserRentalRequestsDB = async (tenantId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
    },
    include: {
      property: {
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
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const approveRentalRequest = async (
  rentalRequestId: string,
  landlordId: string,
  status: RentalStatus,
) => {
  // validate status
  // find rental
  // verify landlord owns the property
  // verify current status is PENDING

  const result = await prisma.rentalRequest.update({
    where: {
      id: rentalRequestId,
    },
    data: {
      status,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      property: {
        include: {
          category: true,
        },
      },
    },
  });

  return result;
};


const getAllRentals = async (query: IRentalQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: RentalRequestWhereInput[] = [];

  // Search
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          tenant: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          tenant: {
            email: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          property: {
            title: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          property: {
            city: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Status 
  if (query.status) {
    const status = query.status.toUpperCase() as RentalStatus;

    if (Object.values(RentalStatus).includes(status)) {
      andConditions.push({
        status,
      });
    }
  }

  if (query.city) {
    andConditions.push({
      property: {
        city: {
          equals: query.city,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.tenantId) {
    andConditions.push({
      tenantId: query.tenantId,
    });
  }

  if (query.landlordId) {
    andConditions.push({
      property: {
        landlordId: query.landlordId,
      },
    });
  }

  if (query.propertyId) {
    andConditions.push({
      propertyId: query.propertyId,
    });
  }

  if (query.moveInDate) {
    andConditions.push({
      moveInDate: new Date(query.moveInDate),
    });
  }

  const where: RentalRequestWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
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
          },
        },
      },
    }),

    prisma.rentalRequest.count({
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
    data: rentals,
  };
};

export const rentalService = {
  createRentals,
  getRentalsOnPropertyForLandlord,
  getRentalsById,
  getUserRentalRequestsDB,
  approveRentalRequest,
  getAllRentals
};
