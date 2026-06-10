-- CreateEnum
CREATE TYPE "JobTiming" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobGender" AS ENUM ('MALE', 'FEMALE', 'BOTH');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "education" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "gender" "JobGender" NOT NULL DEFAULT 'BOTH',
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "jobTiming" "JobTiming" NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN     "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "salaryRange" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "vacancies" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "workingDays" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'OPEN';
