/*
  Warnings:

  - You are about to drop the column `DoB` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RENTER', 'LANDLORD', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "DoB",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'RENTER',
ALTER COLUMN "phone" DROP NOT NULL;
