export interface IPropertyPayload {
  title: string;
  city: string;
  price: number;
  categoryName: string;
  categoryDescription: string;
}

export interface IPropertyQuery {
  page?: string;
  limit?: string;

  searchTerm?: string;

  title?: string;
  city?: string;

  minPrice?: string;
  maxPrice?: string;

  type?: string;

  landlordId?: string;

  isAvailable?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
