-- AlterTable
ALTER TABLE "bugs" ADD COLUMN     "evidenceFileNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoEvidence" TEXT;
