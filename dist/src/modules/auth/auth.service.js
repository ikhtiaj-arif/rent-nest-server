import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
// Auth Service placeholder
const registerDB = async (payload) => {
    const { email, password, name, phone } = payload;
    const userExists = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (userExists) {
        throw new Error("User with this email already exists ");
    }
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
        },
    });
    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email,
        },
        omit: {
            password: true,
        },
    });
    return user;
};
const loginUser = async (payload) => {
    const { email, password } = payload;
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email,
        },
    });
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password is incorrect");
    }
    const jwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
    };
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, {
        expiresIn: config.jwt_access_expires_in,
    });
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, {
        expiresIn: config.jwt_refresh_expires_in,
    });
    return { accessToken, refreshToken };
};
const getUserProfile = async (userId) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
        omit: {
            password: true,
        },
    });
    return user;
};
export const authService = {
    registerDB,
    loginUser,
    getUserProfile,
};
//# sourceMappingURL=auth.service.js.map