const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const res = await prisma.passwordResetRequest.count();
    console.log("Count:", res);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
