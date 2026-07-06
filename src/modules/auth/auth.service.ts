import bcrypt from "bcryptjs";
import config from "src/config";
import { prisma } from "src/lib/prisma";
import { ILoginUser, IRegisterUserPayload } from "./auth.interface";
import { jwtUtils } from "src/utils/jwt";
import { SignOptions } from "jsonwebtoken";

// Auth Service placeholder
const registerDB = async (payload: IRegisterUserPayload) => {
  const { email, password, name, phone } = payload;

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExists) {
    throw new Error("User with this email already exists ");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

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
const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  console.log(user);
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

    const accessToken = jwtUtils.createToken(
      jwtPayload,
      config.jwt_access_secret,
      {
        expiresIn: config.jwt_access_expires_in,
      } as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
      jwtPayload,
      config.jwt_refresh_secret,
      {
        expiresIn: config.jwt_refresh_expires_in,
      } as SignOptions,
    );

    return { accessToken, refreshToken };
};
const getUserProfile = async () => {
  return "User profile retrieved successfully";
};

export const authService = {
  registerDB,
  loginUser,
  getUserProfile,
};
