-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('player', 'sponsor', 'admin');
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationProof" DROP CONSTRAINT "VerificationProof_userId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "accepted",
DROP COLUMN "orgId",
DROP COLUMN "paidAt",
DROP COLUMN "playerId",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "entry" TEXT NOT NULL,
ADD COLUMN     "entryFee" TEXT,
ADD COLUMN     "gameType" TEXT NOT NULL,
ADD COLUMN     "mode" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizerId" TEXT NOT NULL,
ADD COLUMN     "prize" TEXT NOT NULL,
ADD COLUMN     "prizePool" TEXT,
ADD COLUMN     "slots" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open',
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "college",
DROP COLUMN "iglCapable",
DROP COLUMN "rank",
DROP COLUMN "status",
DROP COLUMN "verified",
ADD COLUMN     "brRank" TEXT,
ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "csRank" TEXT,
ADD COLUMN     "gameUid" TEXT,
ADD COLUMN     "visibleToSponsors" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "VerificationProof";

-- CreateTable
CREATE TABLE "MatchEntry" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchEntry_matchId_playerId_key" ON "MatchEntry"("matchId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_matchId_reporterId_key" ON "Report"("matchId", "reporterId");

-- CreateIndex
CREATE INDEX "Match_status_date_idx" ON "Match"("status", "date");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEntry" ADD CONSTRAINT "MatchEntry_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEntry" ADD CONSTRAINT "MatchEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
