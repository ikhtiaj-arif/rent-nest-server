import { PropertyWhereInput } from "generated/prisma/models";

export interface IPropertyPayload {
  title: string;
  city: string;
  price: number;
  categoryName: string;
  categoryDescription: string;
}

export interface IPropertyQuery extends PropertyWhereInput {
  searchTerm?: string;

  title?: string;
  city?: string;

  minPrice?: string;
  maxPrice?: string;

  type?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
}
