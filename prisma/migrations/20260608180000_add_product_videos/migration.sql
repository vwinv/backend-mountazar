-- CreateTable
CREATE TABLE "ProductVideo" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVideo" ADD CONSTRAINT "ProductVideo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrer les vidéos existantes (champ videoUrl)
INSERT INTO "ProductVideo" ("productId", "url", "createdAt")
SELECT "id", "videoUrl", NOW()
FROM "Product"
WHERE "videoUrl" IS NOT NULL AND TRIM("videoUrl") <> '';
