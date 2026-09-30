import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.user.create({
      data: {
        name: "Test Partner",
        email: "test_partner@talentonus.com",
        mobile: "1234567890",
        password: "hashedpassword",
        role: "ASSOCIATE_PARTNER" as any,
      }
    })
    console.log("Success!")
  } catch (e) {
    console.error("ERROR CAUGHT:")
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
