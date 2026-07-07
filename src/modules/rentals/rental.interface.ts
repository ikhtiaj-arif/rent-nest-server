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
export interface ILandlordRentalQuery {
  page?: string;
  limit?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IUserRentalQuery {
  page?: string;
  limit?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
