// Admin Service placeholder
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
const getAllUsers = async (query) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const andConditions = [];
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
        const role = query.role.toUpperCase();
        if (Object.values(Role).includes(role)) {
            andConditions.push({
                role,
            });
        }
    }
    // Status
    if (query.status) {
        const status = query.status.toUpperCase();
        if (Object.values(UserStatus).includes(status)) {
            andConditions.push({
                status,
            });
        }
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
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
const updateUserById = async (userId, payload) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const status = payload.status.toUpperCase();
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
//# sourceMappingURL=admin.service.js.map