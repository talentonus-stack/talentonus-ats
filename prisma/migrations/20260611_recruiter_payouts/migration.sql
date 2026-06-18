-- AlterTable
ALTER TABLE "Placement" ADD COLUMN IF NOT EXISTS "recruiterPaymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
