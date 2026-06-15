-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionPercentage" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentTermsDays" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentReleaseCondition" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "recruiterType" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agreementSigned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agreementDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agreementExpiryDate" TIMESTAMP(3);

-- We are leaving defaultCommissionPercentage in the DB if it already exists, to avoid data loss / destructive drops in production.
-- Application logic will transition to using commissionPercentage.
