-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- Adiciona inicialmente colunas como NULL
ALTER TABLE "Professional" ADD COLUMN "cityId" INTEGER;
ALTER TABLE "HealthUnit" ADD COLUMN "cityId" INTEGER;
ALTER TABLE "Attendance" ADD COLUMN "healthUnitId" INTEGER;

-- Cria uma cidade padrão
INSERT INTO "City" ("name", "state") VALUES ('Cidade Padrão', 'SP');

-- Atualiza as unidades de saúde existentes para usar a primeira cidade
UPDATE "HealthUnit" SET "cityId" = (SELECT MIN(id) FROM "City");

-- Atualiza os profissionais existentes para usar a primeira cidade
UPDATE "Professional" SET "cityId" = (SELECT MIN(id) FROM "City");

-- Atualiza os atendimentos existentes para usar a primeira unidade de saúde
UPDATE "Attendance" SET "healthUnitId" = (SELECT MIN(id) FROM "HealthUnit");

-- Agora torna as colunas NOT NULL
ALTER TABLE "Professional" ALTER COLUMN "cityId" SET NOT NULL;
ALTER TABLE "HealthUnit" ALTER COLUMN "cityId" SET NOT NULL;
ALTER TABLE "Attendance" ALTER COLUMN "healthUnitId" SET NOT NULL;

-- Adiciona as Foreign Keys
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HealthUnit" ADD CONSTRAINT "HealthUnit_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_healthUnitId_fkey" FOREIGN KEY ("healthUnitId") REFERENCES "HealthUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;