-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "userName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Metafields" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "dimension" JSONB,
    "money" JSONB NOT NULL,
    "multi_line_text_field" TEXT NOT NULL,
    "rating" JSONB NOT NULL,
    "link" TEXT,
    "volume" JSONB,
    "weight" JSONB
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "cost" JSONB NOT NULL,
    "benefits" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productAId" TEXT NOT NULL,
    "productBId" TEXT NOT NULL,
    "comparedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "shop" TEXT
);

-- CreateIndex
CREATE INDEX "ProductComparison_productAId_idx" ON "ProductComparison"("productAId");

-- CreateIndex
CREATE INDEX "ProductComparison_productBId_idx" ON "ProductComparison"("productBId");

-- CreateIndex
CREATE INDEX "ProductComparison_userId_idx" ON "ProductComparison"("userId");

-- CreateIndex
CREATE INDEX "ProductComparison_shop_idx" ON "ProductComparison"("shop");
