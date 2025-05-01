/*
  Warnings:

  - Added the required column `multi_line_text_field` to the `Metafields` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('freeTrial', 'launch', 'growth', 'enterprise');

-- AlterTable
ALTER TABLE "Metafields" ADD COLUMN     "multi_line_text_field" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" INTEGER NOT NULL,
    "tier" "Tier" NOT NULL,
    "cost" JSONB NOT NULL,
    "benefits" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
