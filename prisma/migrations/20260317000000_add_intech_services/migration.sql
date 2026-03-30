-- CreateTable
CREATE TABLE "IntechService" (
    "id" SERIAL NOT NULL,
    "codeService" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "typeOperation" TEXT,
    "typeService" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntechService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntechService_codeService_key" ON "IntechService"("codeService");
