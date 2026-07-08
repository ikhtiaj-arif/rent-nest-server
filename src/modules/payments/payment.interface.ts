
export interface ICreatePaymentPayload {
  rentalRequestId: string;
}

export interface IPaymentQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}
