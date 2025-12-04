import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const badgesSeed: SeedFunction = {
  name: 'badges',
  dependencies: ['users'],
  seed: async (prisma: PrismaClient, data: any) => {
    const { adminUser, student2 } = data.users

    const earlyBirdBadge = await prisma.badge.create({
      data: {
        slug: "early-bird",
        name: "Early Bird",
        description: "Joined Academora during our early launch phase. Thank you for being one of our first users!",
        iconUrl: "https://example.com/badges/early-bird.svg",
        category: "Milestone",
      }
    })

    const topContributorBadge = await prisma.badge.create({
      data: {
        slug: "top-contributor",
        name: "Top Contributor",
        description: "Made significant contributions to the community through reviews, articles, or helpful comments.",
        iconUrl: "https://example.com/badges/top-contributor.svg",
        category: "Community",
      }
    })

    const ambassadorBadge = await prisma.badge.create({
      data: {
        slug: "ambassador",
        name: "Ambassador",
        description: "Helped grow the Academora community by referring multiple users.",
        iconUrl: "https://example.com/badges/ambassador.svg",
        category: "Referral",
      }
    })

    // Award "Early Bird" badge to Admin
    await prisma.userBadge.create({
      data: {
        userId: adminUser.id,
        badgeId: earlyBirdBadge.id,
        awardedAt: new Date(),
      }
    })

    // Award "Ambassador" badge to student2 (referrer)
    if (student2) {
      await prisma.userBadge.create({
        data: {
          userId: student2.id,
          badgeId: ambassadorBadge.id,
          awardedAt: new Date(),
        }
      })
    }

    return { earlyBirdBadge, topContributorBadge, ambassadorBadge }
  }
}
