-- Additive: safety reporting and automatic posting pause.
-- Report.category records why a match was reported ("payment_request" is enforced).
-- User.postingPausedUntil is a server-clock timestamp; no admin action is needed.
ALTER TABLE "Report" ADD COLUMN "category" TEXT;
ALTER TABLE "User" ADD COLUMN "postingPausedUntil" TIMESTAMP(3);
