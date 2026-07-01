import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const jobs = await prisma.job.findMany()
  console.log("Jobs found:", jobs.length)
  if (jobs.length > 0) {
    console.log("First job sample:", jobs[0])
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
