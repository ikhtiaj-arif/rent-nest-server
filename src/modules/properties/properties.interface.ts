export interface IPropertyPayload {
  title: string;
  description: string;
  city: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  availableFrom: Date | string;
  furnished: boolean;
  isAvailable: boolean; // <-- add this
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
