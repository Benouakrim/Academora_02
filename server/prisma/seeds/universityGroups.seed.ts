import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const universityGroupsSeed: SeedFunction = {
  name: 'universityGroups',
  dependencies: ['universities'],
  seed: async (prisma: PrismaClient, data: any) => {
    const universities = data.universities
    const mit = universities.find((u: any) => u.slug === 'mit')
    const harvard = universities.find((u: any) => u.slug === 'harvard')
    
    const ivyLeague = await prisma.universityGroup.create({
      data: {
        name: "Ivy League",
        slug: "ivy-league",
        description: "The eight private institutions of higher education in the Northeastern United States known for academic excellence, selectivity, and social prestige.",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Ivy_League_logo.svg/1200px-Ivy_League_logo.svg.png",
        website: "https://ivyleague.com",
        memberCount: 8,
        universities: {
          connect: [
            ...(mit ? [{ id: mit.id }] : []),
            ...(harvard ? [{ id: harvard.id }] : []),
          ]
        }
      }
    })

    return { ivyLeague }
  }
}
