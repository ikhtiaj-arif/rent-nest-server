// Admin Service placeholder

import { Role, UserStatus } from "generated/prisma/enums";
import { UserWhereInput } from "generated/prisma/models";
import { prisma } from "src/lib/prisma";
import { IUserQuery } from "../auth/auth.interface";

const getAllUsers = async (query: IUserQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: UserWhereInput[] = [];

  // Search
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Role
  if (query.role) {
    const role = query.role.toUpperCase() as Role;

    if (Object.values(Role).includes(role)) {
      andConditions.push({
        role,
      });
    }
  }

  // Status
  if (query.status) {
    const status = query.status.toUpperCase() as UserStatus;

    if (Object.values(UserStatus).includes(status)) {
      andConditions.push({
        status,
      });
    }
  }

  const where: UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.user.count({
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
    data: users,
  };
};
const updateUserById = async (
  userId: string,
  payload: {
    status: UserStatus;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const status = payload.status.toUpperCase() as UserStatus;

  if (!Object.values(UserStatus).includes(status)) {
    throw new Error("Invalid user status");
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

export const adminService = {
  getAllUsers,
  updateUserById,
};
