export interface IPropertyPayload {
  title: string;
  city: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  description: string;
  availableFrom: string;
  furnished: string;
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
