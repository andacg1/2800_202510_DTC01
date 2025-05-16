/*
  Warnings:

  - You are about to drop the column `productAId` on the `ProductComparison` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ProductComparison` table. All the data in the column will be lost.
  - Added the required column `originalProductId` to the `ProductComparison` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "originalProductId" TEXT NOT NULL,
    "comparedProducts" JSONB NOT NULL,
    "comparedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "shop" TEXT
);
INSERT INTO "new_ProductComparison" ("collectionId", "comparedAt", "comparedProducts", "id", "shop") SELECT "collectionId", "comparedAt", "comparedProducts", "id", "shop" FROM "ProductComparison";
DROP TABLE "ProductComparison";
ALTER TABLE "new_ProductComparison" RENAME TO "ProductComparison";
CREATE INDEX "ProductComparison_originalProductId_idx" ON "ProductComparison"("originalProductId");
CREATE INDEX "ProductComparison_collectionId_idx" ON "ProductComparison"("collectionId");
CREATE INDEX "ProductComparison_sessionId_idx" ON "ProductComparison"("sessionId");
CREATE INDEX "ProductComparison_shop_idx" ON "ProductComparison"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
