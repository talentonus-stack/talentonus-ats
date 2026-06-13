-- AlterTable
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "gstApplicable" BOOLEAN DEFAULT true;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "clientAgreementSigned" BOOLEAN DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "agreementExpiryDate" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "commercialRemarks" TEXT;
