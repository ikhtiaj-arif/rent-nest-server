import { RentalStatus } from "generated/prisma/enums";
import { RentalRequestWhereInput } from "generated/prisma/models";
import { prisma } from "src/lib/prisma";

interface ICreateRentalPayload {
  propertyId: string;
  moveInDate: Date;
}

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
    whereCondition.status = status;
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
const approveRentalRequest = async () => {
  return "Rental retrieved successfully";
};

export const rentalService = {
  createRentals,
  getRentalsOnPropertyForLandlord,
  getRentalsById,
  getUserRentalRequestsDB,
  approveRentalRequest,
};
