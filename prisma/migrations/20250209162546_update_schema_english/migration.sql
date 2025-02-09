/*
  Warnings:

  - Changed the type of `profile` on the `Professional` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "profile",
ADD COLUMN     "profile" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Profile";
