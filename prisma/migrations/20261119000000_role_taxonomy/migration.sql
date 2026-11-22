-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('rusher', 'sniper', 'support', 'anchor', 'lurker');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "iglCapable" BOOLEAN NOT NULL DEFAULT false;

