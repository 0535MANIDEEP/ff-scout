-- Additive only: new review tier between players/organizers and admin.
-- Postgres allows ADD VALUE inside a transaction; existing rows are untouched.
ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'moderator';
