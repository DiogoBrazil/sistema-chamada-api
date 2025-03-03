/*
  Warnings:

  - Added the required column `socialName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AttendanceStage" ADD VALUE 'DENTAL_CONSULTATION';

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "race" TEXT,
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "socialName" TEXT NOT NULL;


UPDATE "Patient" SET "socialName" = "fullName" WHERE "socialName" IS NULL;

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sex" TEXT;

-- CreateTable
CREATE TABLE "PatientAddress" (
    "id" SERIAL NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT true,
    "patientId" INTEGER NOT NULL,

    CONSTRAINT "PatientAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalAddress" (
    "id" SERIAL NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT true,
    "professionalId" INTEGER NOT NULL,

    CONSTRAINT "ProfessionalAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PatientAddress" ADD CONSTRAINT "PatientAddress_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalAddress" ADD CONSTRAINT "ProfessionalAddress_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;