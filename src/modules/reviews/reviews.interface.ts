export interface ICreateReviewPayload {
  propertyId: string;
  rentalRequestId: string; // used to verify completed rental
  rating: number; // 1–5
  comment: string;
}
