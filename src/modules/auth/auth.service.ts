import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";

import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";
import { ILoginUser, IRegisterUserPayload } from "./auth.interface";

// Roles the public /register endpoint is allowed to create.
// ADMIN is intentionally excluded — admin accounts are seeded only,
// never self-registered, to avoid an unauthenticated user granting
// themselves platform-wide access.
const SELF_REGISTERABLE_ROLES: Role[] = [Role.TENANT, Role.LANDLORD];

// Auth Service placeholder
const registerDB = async (payload: IRegisterUserPayload) => {
  const { email, password, name, phone, role } = payload;

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExists) {
    throw new Error("User with this email already exists ");
  }

  // Default to TENANT if no role is provided; reject anything that
  // isn't an allowed self-registerable role (blocks ADMIN and any
  // unrecognized value from being passed straight through).
  const resolvedRole = role ?? Role.TENANT;
  if (!SELF_REGISTERABLE_ROLES.includes(resolvedRole)) {
    throw new Error("Invalid role. Must be TENANT or LANDLORD");
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
      role: resolvedRole,
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
    
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
     config.jwt_refresh_expires_in as SignOptions,
  );

  return { accessToken, refreshToken };
};
const getUserProfile = async (userId: string) => {
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

const refreshToken = async (refreshToken: string) => {

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (user.status === "BANNED") {
    throw new Error("User is blocked!");
  }

  const jwtPayload = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return { accessToken };
};

export const authService = {
  registerDB,
  loginUser,
  getUserProfile,
  refreshToken,
};
