/*
  Warnings:

  - You are about to drop the column `averageRating` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "averageRating",
DROP COLUMN "totalReviews";
