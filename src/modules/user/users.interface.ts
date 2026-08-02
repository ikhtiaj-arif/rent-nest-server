import { Gender } from "../../../generated/prisma/enums";

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  gender?: Gender | null;
  dateOfBirth?: Date | null;
  address?: string | null;
};