export interface IRentalQuery {
  page?: string;
  limit?: string;

  searchTerm?: string;

  status?: string;
  city?: string;

  tenantId?: string;
  landlordId?: string;
  propertyId?: string;

  moveInDate?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ICreateRentalPayload {
  propertyId: string;
  moveInDate: Date;
}
