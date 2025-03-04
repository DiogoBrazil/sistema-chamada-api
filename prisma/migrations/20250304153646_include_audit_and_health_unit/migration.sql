/*
  Warnings:

  - You are about to drop the `_ProfessionalTohealthUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthUnitAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProfessionalTohealthUnit" DROP CONSTRAINT "_ProfessionalTohealthUnit_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProfessionalTohealthUnit" DROP CONSTRAINT "_ProfessionalTohealthUnit_B_fkey";

-- DropForeignKey
ALTER TABLE "healthUnitAddress" DROP CONSTRAINT "healthUnitAddress_healthUnitId_fkey";

-- DropForeignKey
ALTER TABLE "healthUnitFlowAudit" DROP CONSTRAINT "healthUnitFlowAudit_healthUnitId_fkey";

-- DropTable
DROP TABLE "_ProfessionalTohealthUnit";

-- DropTable
DROP TABLE "healthUnit";

-- DropTable
DROP TABLE "healthUnitAddress";

-- CreateTable
CREATE TABLE "HealthUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "HealthUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthUnitAddress" (
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

    CONSTRAINT "HealthUnitAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HealthUnitToProfessional" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HealthUnitToProfessional_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthUnit_cnpj_key" ON "HealthUnit"("cnpj");

-- CreateIndex
CREATE INDEX "_HealthUnitToProfessional_B_index" ON "_HealthUnitToProfessional"("B");

-- AddForeignKey
ALTER TABLE "HealthUnitAddress" ADD CONSTRAINT "HealthUnitAddress_healthUnitId_fkey" FOREIGN KEY ("healthUnitId") REFERENCES "HealthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthUnitFlowAudit" ADD CONSTRAINT "healthUnitFlowAudit_healthUnitId_fkey" FOREIGN KEY ("healthUnitId") REFERENCES "HealthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HealthUnitToProfessional" ADD CONSTRAINT "_HealthUnitToProfessional_A_fkey" FOREIGN KEY ("A") REFERENCES "HealthUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HealthUnitToProfessional" ADD CONSTRAINT "_HealthUnitToProfessional_B_fkey" FOREIGN KEY ("B") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
