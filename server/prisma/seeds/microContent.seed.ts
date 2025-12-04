import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const microContentSeed: SeedFunction = {
  name: 'microContent',
  dependencies: ['universities'],
  seed: async (prisma: PrismaClient, data: any) => {
    const universities = data.universities
    const mit = universities.find((u: any) => u.slug === 'mit')
    const stanford = universities.find((u: any) => u.slug === 'stanford')

    if (mit) {
      await prisma.microContent.create({
        data: {
          universityId: mit.id,
          category: "application_tips",
          title: "MIT Early Action Advantage",
          content: "MIT strongly encourages applying early action if you're certain about MIT. While it's not binding, acceptance rates are typically higher for EA applicants. Make sure your application showcases your passion for STEM and innovation.",
          priority: 1,
        }
      })

      await prisma.microContent.create({
        data: {
          universityId: mit.id,
          category: "financial_aid",
          title: "Need-Blind Admissions",
          content: "MIT practices need-blind admissions for all applicants, including international students. They meet 100% of demonstrated financial need through grants, scholarships, and work-study programs.",
          priority: 2,
        }
      })
    }

    if (stanford) {
      await prisma.microContent.create({
        data: {
          universityId: stanford.id,
          category: "campus_life",
          title: "Silicon Valley Advantage",
          content: "Stanford's location in Silicon Valley provides unparalleled access to tech internships, startup culture, and networking opportunities. Many students intern at major tech companies or start their own ventures.",
          priority: 1,
        }
      })

      await prisma.microContent.create({
        data: {
          universityId: stanford.id,
          category: "application_tips",
          title: "Test-Optional Policy",
          content: "Stanford has adopted a test-optional policy. While strong test scores can still strengthen your application, focus on crafting compelling essays that showcase your unique perspective and experiences.",
          priority: 2,
        }
      })
    }

    return true
  }
}
