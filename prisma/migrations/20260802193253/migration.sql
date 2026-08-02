-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "LandlordRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "profilePicture" TEXT;

-- CreateTable
CREATE TABLE "landlord_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "LandlordRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestReason" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlord_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landlord_requests_userId_key" ON "landlord_requests"("userId");

-- CreateIndex
CREATE INDEX "landlord_requests_status_idx" ON "landlord_requests"("status");

-- AddForeignKey
ALTER TABLE "landlord_requests" ADD CONSTRAINT "landlord_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
