import { RentalStatus } from "../../../generated/prisma/enums";
import { RentalRequestWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreateRentalPayload,
  ILandlordRentalQuery,
  IRentalQuery,
  IUserRentalQuery,
} from "./rental.interface";

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
  query: ILandlordRentalQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const whereCondition: RentalRequestWhereInput = {
    property: {
      landlordId,
    },
  };

  if (query.status) {
    const normalizedStatus = query.status.toUpperCase() as RentalStatus;

    if (!Object.values(RentalStatus).includes(normalizedStatus)) {
      throw new Error("Invalid rental status");
    }

    whereCondition.status = normalizedStatus;
  }

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalRequest.findMany({
      where: whereCondition,
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
          },
        },
      },
    }),

    prisma.rentalRequest.count({
      where: whereCondition,
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
          landlord: true,
          images: true,
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          provider: true,
          createdAt: true,
        },
      },

      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      },
    },
  });

  if (!rental) {
    throw new Error("Rental request not found");
  }

  return rental;
};

const getUserRentalRequestsDB = async (
  tenantId: string,
  query: IUserRentalQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const whereCondition: RentalRequestWhereInput = {
    tenantId,
  };

  if (query.status) {
    const normalizedStatus = query.status.toUpperCase() as RentalStatus;

    if (!Object.values(RentalStatus).includes(normalizedStatus)) {
      throw new Error("Invalid rental status");
    }

    whereCondition.status = normalizedStatus;
  }

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalRequest.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
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
    }),

    prisma.rentalRequest.count({
      where: whereCondition,
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

        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            provider: true,
            createdAt: true,
          },
        },

        reviews: {
          select: {
            id: true,
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
const cancelRentalRequest = async (
  rentalRequestId: string,
  tenantId: string,
) => {
  console.log("========== CANCEL RENTAL REQUEST ==========");
  console.log("Rental Request ID:", rentalRequestId);
  console.log("Tenant ID:", tenantId);

  const rental = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalRequestId,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          landlordId: true,
        },
      },
    },
  });

  console.log("Rental Found:", rental);

  if (!rental) {
    throw new Error("Rental request not found");
  }

  if (rental.tenantId !== tenantId) {
    console.log("Authorization failed");
    throw new Error("You are not authorized to cancel this request");
  }

  if (rental.status !== RentalStatus.PENDING) {
    console.log(`Cannot cancel. Current status: ${rental.status}`);

    throw new Error("Only pending requests can be cancelled");
  }

  console.log("Updating rental status to CANCELLED...");

  const updatedRental = await prisma.rentalRequest.update({
    where: {
      id: rentalRequestId,
    },
    data: {
      status: RentalStatus.CANCELLED,
    },
    include: {
      property: true,
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  console.log("Rental cancelled successfully:", updatedRental.id);

  return updatedRental;
};

const endRental = async (
  rentalRequestId: string,
  userId: string,
  role: string,
) => {
  // console.log("Rental ID:", rentalRequestId);
  // console.log("User ID:", userId);
  // console.log("Role:", role);

  const rental = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalRequestId,
    },
    include: {
      property: true,
    },
  });

  // console.log("Rental found:", rental);

  if (!rental) {
    // console.log("  Rental not found");
    throw new Error("Rental not found");
  }

  // console.log("Rental status:", rental.status);

  if (rental.status !== RentalStatus.ACTIVE) {
    // console.log("  Rental is not ACTIVE");
    throw new Error("Only active rentals can be ended");
  }

  // console.log("Tenant ID:", rental.tenantId);
  // console.log("Property Landlord ID:", rental.property.landlordId);

  if (role === "TENANT" && rental.tenantId !== userId) {
    // console.log("  Tenant authorization failed");
    throw new Error("You are not authorized to end this rental");
  }

  if (role === "LANDLORD" && rental.property.landlordId !== userId) {
    // console.log("  Landlord authorization failed");
    throw new Error("You are not authorized to end this rental");
  }

  return prisma.$transaction(async (tx) => {
    const updatedRental = await tx.rentalRequest.update({
      where: {
        id: rentalRequestId,
      },
      data: {
        status: RentalStatus.COMPLETED,
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

    // console.log(" Rental updated:", updatedRental.status);

    const updatedProperty = await tx.property.update({
      where: {
        id: rental.propertyId,
      },
      data: {
        isAvailable: true,
        onRent: false,
      },
    });

    // console.log(" Property updated:", {
    //   id: updatedProperty.id,
    //   isAvailable: updatedProperty.isAvailable,
    //   onRent: updatedProperty.onRent,
    // });

    return updatedRental;
  });
};

export const rentalService = {
  createRentals,
  getRentalsOnPropertyForLandlord,
  getRentalsById,
  getUserRentalRequestsDB,
  approveRentalRequest,
  getAllRentals,
  endRental,
  cancelRentalRequest,
};
