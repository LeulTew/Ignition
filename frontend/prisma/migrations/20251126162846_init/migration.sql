-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "complexity" INTEGER NOT NULL,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_createdAt_idx" ON "Goal"("createdAt");
