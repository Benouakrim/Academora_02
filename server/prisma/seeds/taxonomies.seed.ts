import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const taxonomiesSeed: SeedFunction = {
  name: 'taxonomies',
  seed: async (prisma: PrismaClient) => {
    const categories = [
      { name: "Admissions", slug: "admissions", description: "Tips and guides for getting accepted to universities." },
      { name: "Financial Aid", slug: "financial-aid", description: "Scholarships, grants, and financial assistance information." },
      { name: "Student Life", slug: "student-life", description: "Campus culture, housing, and student experiences." },
      { name: "International Students", slug: "international-students", description: "Visa information and resources for international applicants." },
      { name: "Career Planning", slug: "career-planning", description: "Career guidance and post-graduation opportunities." },
      { name: "Study Tips", slug: "study-tips", description: "Academic success strategies and learning techniques." },
    ]

    const tags = [
      { name: "Engineering", slug: "engineering" },
      { name: "Ivy League", slug: "ivy-league" },
      { name: "Public Ivy", slug: "public-ivy" },
      { name: "Study Abroad", slug: "study-abroad" },
      { name: "STEM", slug: "stem" },
      { name: "Scholarships", slug: "scholarships" },
      { name: "Business", slug: "business" },
      { name: "Liberal Arts", slug: "liberal-arts" },
      { name: "Research", slug: "research" },
      { name: "Internships", slug: "internships" },
    ]

    const createdCategories = await Promise.all(
      categories.map(c => prisma.category.create({ data: c }))
    )
    
    const createdTags = await Promise.all(
      tags.map(t => prisma.tag.create({ data: t }))
    )

    return { categories: createdCategories, tags: createdTags }
  }
}
