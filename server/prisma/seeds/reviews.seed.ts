import { PrismaClient, ReviewStatus } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const reviewsSeed: SeedFunction = {
  name: 'reviews',
  dependencies: ['universities', 'users'],
  seed: async (prisma: PrismaClient, data: any) => {
    const { adminUser, student1 } = data.users
    const universities = data.universities
    const mit = universities.find((u: any) => u.slug === 'mit')
    const stanford = universities.find((u: any) => u.slug === 'stanford')

    if (mit && adminUser) {
      await prisma.review.create({
        data: {
          userId: adminUser.id,
          universityId: mit.id,
          rating: 5.0,
          academicRating: 5.0,
          campusRating: 4.0,
          socialRating: 3.0,
          careerRating: 5.0,
          title: "Intense but rewarding",
          content: "MIT is exactly as hard as they say it is, but the opportunities are endless. The research opportunities, faculty support, and career outcomes are unmatched. The workload is intense, but you'll learn more than you ever thought possible.",
          status: ReviewStatus.APPROVED,
          helpfulCount: 42,
          verified: true,
          anonymous: false,
        }
      })
    }

    if (stanford && student1) {
      await prisma.review.create({
        data: {
          userId: student1.id,
          universityId: stanford.id,
          rating: 4.5,
          academicRating: 5.0,
          campusRating: 5.0,
          socialRating: 4.0,
          careerRating: 5.0,
          title: "Beautiful campus, amazing opportunities",
          content: "Stanford's campus is absolutely stunning, and the proximity to Silicon Valley is incredible for internships and networking. The academics are rigorous but the support system is strong.",
          status: ReviewStatus.APPROVED,
          helpfulCount: 28,
          verified: false,
          anonymous: false,
        }
      })
    }

    return true
  }
}
