-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "resumeFile";
ALTER TABLE "Candidate" ADD COLUMN "resumeFileName" TEXT;
