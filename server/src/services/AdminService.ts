import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AdminService {
  static async getDashboardStats() {
    const [users, universities, saved] = await Promise.all([
      prisma.user.count(),
      prisma.university.count(),
      prisma.savedUniversity.count(),
    ])

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    })

    return {
      counts: { users, universities, saved },
      recentUsers,
    }
  }
}
