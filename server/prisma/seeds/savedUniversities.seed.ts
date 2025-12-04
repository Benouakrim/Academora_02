import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const savedUniversitiesSeed: SeedFunction = {
  name: 'savedUniversities',
  dependencies: ['universities', 'users'],
  seed: async (prisma: PrismaClient, data: any) => {
    const { student1 } = data.users
    const universities = data.universities
    const mit = universities.find((u: any) => u.slug === 'mit')
    const stanford = universities.find((u: any) => u.slug === 'stanford')

    if (student1 && mit && stanford) {
      await prisma.savedUniversity.create({
        data: {
          userId: student1.id,
          universityId: mit.id,
          status: "PLANNED",
          notes: "Dream school - need to improve SAT scores",
        }
      })

      await prisma.savedUniversity.create({
        data: {
          userId: student1.id,
          universityId: stanford.id,
          status: "APPLIED",
          notes: "Applied early action - waiting for decision",
        }
      })
    }

    return true
  }
}
