import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check the active database URL (masking the password)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log("DATABASE_URL Host/Reference:", maskedUrl);

    // Run the query to check ENUM values
    const result = await prisma.$queryRaw`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'Role'
      ORDER BY e.enumsortorder;
    `;
    console.log("Role Enum Values in DB:", result);

    const dbName = await prisma.$queryRaw`SELECT current_database()`;
    console.log("Current Database:", dbName);
  } catch(e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
