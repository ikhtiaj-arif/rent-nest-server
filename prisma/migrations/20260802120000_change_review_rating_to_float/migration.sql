-- AlterTable
-- Reviews were submitted from the UI as half-star values (e.g. 4.5),
-- but this column was INTEGER, so the Prisma client rejected every
-- half-star submission with a validation error. Float matches
-- Property.averageRating, which was already storing fractional values.
ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;
