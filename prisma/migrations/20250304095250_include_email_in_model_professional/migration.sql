/*
  Warnings:

  - Made the column `number` on table `PatientAddress` required. This step will fail if there are existing NULL values in that column.
  - Made the column `number` on table `ProfessionalAddress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PatientAddress" ALTER COLUMN "number" SET NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "ProfessionalAddress" ALTER COLUMN "number" SET NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;
