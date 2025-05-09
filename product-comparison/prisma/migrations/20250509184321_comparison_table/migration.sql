/*
  Warnings:

  - You are about to drop the column `productBId` on the `ProductComparison` table. All the data in the column will be lost.
  - Added the required column `collectionId` to the `ProductComparison` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comparedProducts` to the `ProductComparison` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "productAId" TEXT NOT NULL,
    "comparedProducts" JSONB NOT NULL,
    "comparedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "shop" TEXT
);
INSERT INTO "new_ProductComparison" ("comparedAt", "id", "productAId", "shop", "userId") SELECT "comparedAt", "id", "productAId", "shop", "userId" FROM "ProductComparison";
DROP TABLE "ProductComparison";
ALTER TABLE "new_ProductComparison" RENAME TO "ProductComparison";
CREATE INDEX "ProductComparison_productAId_idx" ON "ProductComparison"("productAId");
CREATE INDEX "ProductComparison_comparedProducts_idx" ON "ProductComparison"("comparedProducts");
CREATE INDEX "ProductComparison_userId_idx" ON "ProductComparison"("userId");
CREATE INDEX "ProductComparison_shop_idx" ON "ProductComparison"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
