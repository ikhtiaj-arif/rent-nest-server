import { Role, UserStatus } from "generated/prisma/enums";

export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  phone?: string | null; // Optional/Nullable field
  createdAt: Date;
  updatedAt: Date;

  // Relations (Optional, depending on your API responses)
  properties?: any[]; // Replace 'any' with your IProperty interface
  rentalRequests?: any[]; // Replace 'any' with your IRentalRequest interface
  reviews?: any[]; // Replace 'any' with your IReview interface
}
export interface ILoginUser {
    email: string;
    password: string;
}