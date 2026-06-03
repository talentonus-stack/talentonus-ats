-- Safely add columns to Company table (will error if already added, but that's fine, it means they are there)
ALTER TABLE "Company"
ADD COLUMN IF NOT EXISTS "finalRoundDesc" TEXT,
ADD COLUMN IF NOT EXISTS "finalRoundName" TEXT,
ADD COLUMN IF NOT EXISTS "isConfidential" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "round1Desc" TEXT,
ADD COLUMN IF NOT EXISTS "round1Name" TEXT,
ADD COLUMN IF NOT EXISTS "round2Desc" TEXT,
ADD COLUMN IF NOT EXISTS "round2Name" TEXT,
ADD COLUMN IF NOT EXISTS "round3Desc" TEXT,
ADD COLUMN IF NOT EXISTS "round3Name" TEXT,
ADD COLUMN IF NOT EXISTS "totalEmployees" TEXT,
ADD COLUMN IF NOT EXISTS "workingDays" TEXT,
ADD COLUMN IF NOT EXISTS "workingHours" TEXT,
ADD COLUMN IF NOT EXISTS "clientSince" TIMESTAMP(3);

-- Remove deprecated columns/tables if they exist (clean up from previous attempts)
DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "feeType";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "feeValue";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "placementGuarantee";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "replacementPeriod";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "paymentTerms";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "gstApplicable";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "round1Duration";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "round2Duration";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "round3Duration";
EXCEPTION WHEN undefined_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Company" DROP COLUMN "finalRoundDuration";
EXCEPTION WHEN undefined_column THEN null; END $$;

DROP TABLE IF EXISTS "CompanyDocument";
DROP TYPE IF EXISTS "DocumentCategory";
DROP TYPE IF EXISTS "FeeType";
