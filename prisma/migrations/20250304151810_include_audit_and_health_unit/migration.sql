/*
  Warnings:

  - You are about to drop the column `timestamp` on the `AttendanceHistory` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FlowAction" AS ENUM ('ATTENDANCE_GENERATED', 'PATIENT_CALLED', 'PATIENT_REFERRED', 'ATTENDANCE_FINALIZED');

-- AlterTable
ALTER TABLE "AttendanceHistory" DROP COLUMN "timestamp",
ADD COLUMN     "cidid" INTEGER,
ADD COLUMN     "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PatientAddress" ALTER COLUMN "number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProfessionalAddress" ALTER COLUMN "number" DROP NOT NULL;

-- CreateTable
CREATE TABLE "healthUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "healthUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthUnitAddress" (
    "id" SERIAL NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT true,
    "healthUnitId" INTEGER NOT NULL,

    CONSTRAINT "healthUnitAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthUnitFlowAudit" (
    "id" SERIAL NOT NULL,
    "healthUnitId" INTEGER NOT NULL,
    "flowAction" "FlowAction" NOT NULL,
    "ofTheAttendanceStage" "AttendanceStage",
    "toTheAttendanceStage" "AttendanceStage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "professionalId" INTEGER,
    "patientId" INTEGER,

    CONSTRAINT "healthUnitFlowAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cid" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Cid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfessionalTohealthUnit" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProfessionalTohealthUnit_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "healthUnit_cnpj_key" ON "healthUnit"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Cid_code_key" ON "Cid"("code");

-- CreateIndex
CREATE INDEX "_ProfessionalTohealthUnit_B_index" ON "_ProfessionalTohealthUnit"("B");

-- AddForeignKey
ALTER TABLE "healthUnitAddress" ADD CONSTRAINT "healthUnitAddress_healthUnitId_fkey" FOREIGN KEY ("healthUnitId") REFERENCES "healthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthUnitFlowAudit" ADD CONSTRAINT "healthUnitFlowAudit_healthUnitId_fkey" FOREIGN KEY ("healthUnitId") REFERENCES "healthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthUnitFlowAudit" ADD CONSTRAINT "healthUnitFlowAudit_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthUnitFlowAudit" ADD CONSTRAINT "healthUnitFlowAudit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceHistory" ADD CONSTRAINT "AttendanceHistory_cidid_fkey" FOREIGN KEY ("cidid") REFERENCES "Cid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessionalTohealthUnit" ADD CONSTRAINT "_ProfessionalTohealthUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessionalTohealthUnit" ADD CONSTRAINT "_ProfessionalTohealthUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "healthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
