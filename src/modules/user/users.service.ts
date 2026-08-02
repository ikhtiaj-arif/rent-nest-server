import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ImageService } from "../image/image.service";
import { UpdateProfilePayload } from "./users.interface";

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      landlordRequest: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateMe = async (userId: string, payload: UpdateProfilePayload) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  console.log(payload);
  const updateData = {
    ...payload,
    ...(payload.dateOfBirth && {
      dateOfBirth: new Date(payload.dateOfBirth),
    }),
  };

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });
};

const changePassword = async (
  userId: string,
  payload: {
    currentPassword: string;
    newPassword: string;
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

  const isMatched = await bcrypt.compare(
    payload.currentPassword,
    user.password,
  );

  if (!isMatched) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS),
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};

const requestLandlord = async (
  userId: string,
  payload: {
    requestReason: string;
  },
) => {

 
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      landlordRequest: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== Role.TENANT) {
    throw new Error("Only tenants can request landlord access");
  }

  if (user.landlordRequest) {
    throw new Error("You have already submitted a landlord request");
  }

  return prisma.landlordRequest.create({
    data: {
      userId,
      requestReason: payload.requestReason,
    },
  });
};

const getLandlordRequest = async (userId: string) => {
  const request = await prisma.landlordRequest.findUnique({
    where: {
      userId,
    },
  });

  return request;
};

const updateProfilePicture = async (
  userId: string,
  files: Express.Multer.File[],
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!files?.length) {
    throw new Error("Profile picture is required");
  }

  const uploadedImages = await ImageService.uploadMultipleImages(files, {
    folder: "profile-pictures",
  });

  if (!uploadedImages.length) {
    throw new Error("Failed to upload profile picture");
  }

  const profileImage = uploadedImages[0];

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePicture: profileImage?.url,
    },
  });
};

export const userService = {
  getMe,
  updateMe,
  changePassword,
  requestLandlord,
  getLandlordRequest,
  updateProfilePicture,
};
