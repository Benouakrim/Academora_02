import { PrismaClient, ReferralStatus } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const referralsSeed: SeedFunction = {
  name: 'referrals',
  dependencies: ['users'],
  seed: async (prisma: PrismaClient, data: any) => {
    const { student1, student2 } = data.users

    if (student2 && student1) {
      // Update student1 to be referred by student2
      await prisma.user.update({
        where: { id: student1.id },
        data: { referredBy: student2.id }
      })

      await prisma.referral.create({
        data: {
          referrerId: student2.id,
          referredUserId: student1.id,
          status: ReferralStatus.COMPLETED,
          rewardClaimed: true,
        }
      })
    }

    return true
  }
}
