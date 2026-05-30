-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECRUITER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'L1_CLEARED', 'L2_CLEARED', 'SELECTED', 'REJECTED', 'JOINED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "location" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "currentSalary" TEXT,
ADD COLUMN     "expectedSalary" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "noticePeriod" TEXT,
ADD COLUMN     "recruiterId" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "skills" TEXT,
ALTER COLUMN "lastName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED';

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
