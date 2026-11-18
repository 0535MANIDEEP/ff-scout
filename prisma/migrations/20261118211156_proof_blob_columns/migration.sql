-- AlterTable
ALTER TABLE "VerificationProof" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "publicId" TEXT,
ALTER COLUMN "fileData" DROP NOT NULL;
