-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONTRACT', 'NDA', 'FEE_AGREEMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "feeType" "FeeType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "feeValue" TEXT,
ADD COLUMN     "finalRoundDesc" TEXT,
ADD COLUMN     "finalRoundDuration" TEXT,
ADD COLUMN     "finalRoundName" TEXT,
ADD COLUMN     "gstApplicable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isConfidential" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "placementGuarantee" TEXT,
ADD COLUMN     "replacementPeriod" TEXT,
ADD COLUMN     "round1Desc" TEXT,
ADD COLUMN     "round1Duration" TEXT,
ADD COLUMN     "round1Name" TEXT,
ADD COLUMN     "round2Desc" TEXT,
ADD COLUMN     "round2Duration" TEXT,
ADD COLUMN     "round2Name" TEXT,
ADD COLUMN     "round3Desc" TEXT,
ADD COLUMN     "round3Duration" TEXT,
ADD COLUMN     "round3Name" TEXT,
ADD COLUMN     "totalEmployees" TEXT,
ADD COLUMN     "workingDays" TEXT,
ADD COLUMN     "workingHours" TEXT;

-- CreateTable
CREATE TABLE "CompanyDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "companyId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyDocument" ADD CONSTRAINT "CompanyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
