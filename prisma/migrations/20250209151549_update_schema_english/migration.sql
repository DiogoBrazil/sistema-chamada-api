/*
  Warnings:

  - You are about to drop the column `currentConsultorio` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the `Atendimento` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `profile` on the `Professional` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Profile" AS ENUM ('DOCTOR', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'FINISHED');

-- DropForeignKey
ALTER TABLE "Atendimento" DROP CONSTRAINT "Atendimento_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Atendimento" DROP CONSTRAINT "Atendimento_professionalId_fkey";

-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "currentConsultorio",
ADD COLUMN     "currentOffice" INTEGER,
DROP COLUMN "profile",
ADD COLUMN     "profile" "Profile" NOT NULL;

-- DropTable
DROP TABLE "Atendimento";

-- DropEnum
DROP TYPE "AtendimentoStatus";

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "professionalId" INTEGER,
    "officeNumber" INTEGER,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
