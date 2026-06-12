-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('SELECTED', 'JOINED', 'INVOICE_GENERATED', 'INVOICE_PAID', 'RECRUITER_PAID');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "offeredCTC" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "paymentTermsDays" INTEGER,
ADD COLUMN "recruitmentFeePercentage" DOUBLE PRECISION,
ADD COLUMN "replacementPeriodDays" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "defaultCommissionPercentage" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "recruiterId" TEXT,
    "offeredCTC" DOUBLE PRECISION NOT NULL,
    "placementValue" DOUBLE PRECISION NOT NULL,
    "recruiterCommissionPercentage" DOUBLE PRECISION NOT NULL,
    "recruiterShare" DOUBLE PRECISION NOT NULL,
    "talentonusShare" DOUBLE PRECISION NOT NULL,
    "joiningDate" TIMESTAMP(3),
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "invoiceAmount" DOUBLE PRECISION,
    "paymentReceivedDate" TIMESTAMP(3),
    "recruiterPaidDate" TIMESTAMP(3),
    "remarks" TEXT,
    "status" "PlacementStatus" NOT NULL DEFAULT 'SELECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Placement_applicationId_key" ON "Placement"("applicationId");

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
