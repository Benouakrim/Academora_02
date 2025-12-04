import { PrismaClient, ClaimStatus } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const universityClaimsSeed: SeedFunction = {
  name: 'universityClaims',
  dependencies: ['universities', 'users'],
  seed: async (prisma: PrismaClient, data: any) => {
    const { stanfordStaff, mitStaff } = data.users
    const universities = data.universities
    const stanford = universities.find((u: any) => u.slug === 'stanford')
    const mit = universities.find((u: any) => u.slug === 'mit')

    if (stanford && stanfordStaff) {
      await prisma.universityClaim.create({
        data: {
          userId: stanfordStaff.id,
          universityId: stanford.id,
          status: ClaimStatus.PENDING,
          institutionalEmail: "staff@stanford.edu",
          verificationDocuments: [
            "https://example.com/docs/stanford-id-front.jpg",
            "https://example.com/docs/stanford-id-back.jpg"
          ],
          position: "Admissions Counselor",
          department: "Office of Undergraduate Admissions",
          comments: "Pending verification of employment status.",
        }
      })
    }

    if (mit && mitStaff) {
      await prisma.universityClaim.create({
        data: {
          userId: mitStaff.id,
          universityId: mit.id,
          status: ClaimStatus.VERIFIED,
          institutionalEmail: "admissions@mit.edu",
          verificationDocuments: [
            "https://example.com/docs/mit-verification.pdf"
          ],
          position: "Senior Admissions Officer",
          department: "Office of Admissions",
          comments: "Verified and approved. Can manage university profile.",
        }
      })
    }

    return true
  }
}
