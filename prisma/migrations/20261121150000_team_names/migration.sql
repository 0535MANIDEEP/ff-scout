-- Additive: esports team names (spec: team-name feature, Option 1).
-- MatchEntry.teamName: the name typed by the player when joining (per match).
-- User.teamName: optional profile default prefilled into esports/competitive join inputs.
ALTER TABLE "MatchEntry" ADD COLUMN "teamName" TEXT;
ALTER TABLE "User" ADD COLUMN "teamName" TEXT;
