/*
  Warnings:

  - You are about to drop the `healthUnitFlowAudit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "healthUnitFlowAudit" DROP CONSTRAINT "healthUnitFlowAudit_healthUnitId_fkey";

-- DropForeignKey
ALTER TABLE "healthUnitFlowAudit" DROP CONSTRAINT "healthUnitFlowAudit_patientId_fkey";

-- DropForeignKey
ALTER TABLE "healthUnitFlowAudit" DROP CONSTRAINT "healthUnitFlowAudit_professionalId_fkey";

-- DropTable
DROP TABLE "healthUnitFlowAudit";

-- CreateTable
CREATE TABLE "HealthUnitFlowAudit" (
    "id" SERIAL NOT NULL,
    "healthUnitId" INTEGER NOT NULL,
    "flowAction" "FlowAction" NOT NULL,
    "ofTheAttendanceStage" "AttendanceStage",
    "toTheAttendanceStage" "AttendanceStage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "professionalId" INTEGER,
    "patientId" INTEGER,

    CONSTRAINT "HealthUnitFlowAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HealthUnitFlowAudit" ADD CONSTRAINT "HealthUnitFlowAudit_healthUnitId_fkey" FOREIGN KEY ("healthUnitId") REFERENCES "HealthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthUnitFlowAudit" ADD CONSTRAINT "HealthUnitFlowAudit_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthUnitFlowAudit" ADD CONSTRAINT "HealthUnitFlowAudit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
