-- Additive only: the organizer unlock record. Nullable; existing rows are untouched.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paidUntil" TIMESTAMP(3);
