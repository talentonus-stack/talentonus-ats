-- Drop old document constraints and tables if they exist
ALTER TABLE IF EXISTS "CompanyDocument" DROP CONSTRAINT IF EXISTS "CompanyDocument_companyId_fkey";
DROP TABLE IF EXISTS "CompanyDocument";
DROP TYPE IF EXISTS "DocumentCategory";

-- Drop old financial types if they exist
ALTER TABLE IF EXISTS "Company" DROP COLUMN IF EXISTS "feeType";
DROP TYPE IF EXISTS "FeeType";

-- AlterTable to drop remaining unwanted fields
ALTER TABLE "Company" DROP COLUMN IF EXISTS "feeValue",
DROP COLUMN IF EXISTS "gstApplicable",
DROP COLUMN IF EXISTS "paymentTerms",
DROP COLUMN IF EXISTS "placementGuarantee",
DROP COLUMN IF EXISTS "replacementPeriod",
DROP COLUMN IF EXISTS "round1Duration",
DROP COLUMN IF EXISTS "round2Duration",
DROP COLUMN IF EXISTS "round3Duration",
DROP COLUMN IF EXISTS "finalRoundDuration";

-- Safely add newly requested columns
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "finalRoundDesc" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "finalRoundName" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isConfidential" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "round1Desc" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "round1Name" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "round2Desc" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "round2Name" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "round3Desc" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "round3Name" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "totalEmployees" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "workingDays" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "workingHours" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "clientSince" TIMESTAMP(3);
