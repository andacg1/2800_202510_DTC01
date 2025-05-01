-- CreateTable
CREATE TABLE "Metafields" (
    "id" TEXT NOT NULL,
    "boolean" BOOLEAN NOT NULL,
    "date" TEXT NOT NULL,
    "dimension" JSONB,
    "money" JSONB NOT NULL,
    "rating" JSONB NOT NULL,
    "url" TEXT,
    "volume" JSONB,
    "weight" JSONB,

    CONSTRAINT "Metafields_pkey" PRIMARY KEY ("id")
);
