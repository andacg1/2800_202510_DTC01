/*
  Warnings:

  - You are about to drop the column `boolean` on the `Metafields` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Metafields` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Metafields` table. All the data in the column will be lost.
  - Added the required column `type` to the `Metafields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('boolean', 'date', 'color');

-- AlterTable
ALTER TABLE "Metafields" DROP COLUMN "boolean",
DROP COLUMN "date",
DROP COLUMN "url",
ADD COLUMN     "link" TEXT,
ADD COLUMN     "type" "Type" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userName" TEXT NOT NULL;
