import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emailArg = process.argv[2]
  if (!emailArg) {
    console.error('Usage: ts-node src/scripts/checkAdmin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email: emailArg } })
  if (!user) {
    console.log(`User not found for email: ${emailArg}`)
  } else {
    const isAdmin = user.role === UserRole.ADMIN
    console.log(JSON.stringify({ email: user.email, role: user.role, isAdmin }, null, 2))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
