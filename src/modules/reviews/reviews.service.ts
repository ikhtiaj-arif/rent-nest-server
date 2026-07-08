import { RentalStatus } from "generated/prisma/enums";
import { prisma } from "src/lib/prisma";
import { ICreateReviewPayload } from "./reviews.interface";

// Reviews Service placeholder

const createReview = async (
  payload: ICreateReviewPayload,
  tenantId: string,
) => {
  const { propertyId, rentalRequestId, rating, comment } = payload;

  //? Step 1 — Validate rating range before hitting DB
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  //? Step 2 — Verify the rental request exists, belongs to this tenant,
  //          and is for the correct property
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  // Ownership check — tenant can only review their own rental
  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("Forbidden. You can only review your own rental");
  }

  // Property match — rentalRequestId must belong to this propertyId
  if (rentalRequest.propertyId !== propertyId) {
    throw new Error("Rental request does not match the given property");
  }

  //? Step 3 — Status check: only ACTIVE rentals can be reviewed
  // ACTIVE means payment was completed (set by webhook)
  // This prevents reviewing unpaid or pending rentals
  if (rentalRequest.status !== RentalStatus.ACTIVE) {
    throw new Error(
      "You can only review a property after your rental is active (payment completed)",
    );
  }

  //? Step 4 — Duplicate check: one review per rental request
  const existingReview = await prisma.review.findUnique({
    where: { id: rentalRequestId },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this rental");
  }

  //? Step 5 — Create the review
  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      tenantId,
      propertyId,
      rentalRequestId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
          city: true,
        },
      },
    },
  });

  // Step 6 — Recalculate and update property's average rating
  // We do this every time a review is created so the property
  // always reflects current rating without complex queries on read
  await updatePropertyAverageRating(propertyId);

  return review;
};

const updatePropertyAverageRating = async (propertyId: string) => {
  const result = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      averageRating: result._avg.rating ?? 0,
      totalReviews: result._count.rating,
    },
  });
};

export const reviewService = {
  createReview,
};
