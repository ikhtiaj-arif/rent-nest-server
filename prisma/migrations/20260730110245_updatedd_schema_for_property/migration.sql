-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "furnished" BOOLEAN NOT NULL DEFAULT false;
