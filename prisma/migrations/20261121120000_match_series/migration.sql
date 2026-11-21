-- CreateTable
CREATE TABLE "MatchSeries" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "entry" TEXT NOT NULL,
    "entryFee" TEXT,
    "prize" TEXT NOT NULL,
    "prizePool" TEXT,
    "city" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "slots" INTEGER,
    "durationMinutes" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTimeLocal" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lookaheadWeeks" INTEGER NOT NULL DEFAULT 2,
    "lastGeneratedAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MatchSeries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MatchSeries_status_idx" ON "MatchSeries"("status");
ALTER TABLE "MatchSeries" ADD CONSTRAINT "MatchSeries_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Three-step Match.endsAt backfill (TP1): nullable -> backfill -> NOT NULL.
ALTER TABLE "Match" ADD COLUMN "endsAt" TIMESTAMP(3);
UPDATE "Match" SET "endsAt" = "date" + INTERVAL '90 minutes' WHERE "endsAt" IS NULL;
ALTER TABLE "Match" ALTER COLUMN "endsAt" SET NOT NULL;

-- Match.seriesId FK (on delete SetNull — deleting a series never deletes matches)
ALTER TABLE "Match" ADD COLUMN "seriesId" TEXT;
ALTER TABLE "Match" ADD CONSTRAINT "Match_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "MatchSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Match_seriesId_date_key" ON "Match"("seriesId", "date");
