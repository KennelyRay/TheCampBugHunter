-- AlterTable
ALTER TABLE "bugs" DROP COLUMN "evidenceFileNames",
DROP COLUMN "videoEvidence",
ADD COLUMN     "evidenceLinks" TEXT[] DEFAULT ARRAY[]::TEXT[];
