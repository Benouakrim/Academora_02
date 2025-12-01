import { PrismaClient, ArticleStatus, ReviewStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Clean up database (Order matters due to foreign keys)
  await prisma.comment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.savedUniversity.deleteMany()
  await prisma.comparison.deleteMany()
  await prisma.article.deleteMany()
  await prisma.category.deleteMany()
  await prisma.university.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create Default User (Author)
  const user = await prisma.user.create({
    data: {
      clerkId: "user_2nodq8s7d9f8s7d9f8s7d9f8", // Mock Clerk ID
      email: "demo@academora.com",
      firstName: "Demo",
      lastName: "User",
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    }
  })

  console.log(`👤 Created user: ${user.email}`)

  // 3. Create Universities with Rich Data
  const universities = [
    {
      name: "Massachusetts Institute of Technology",
      slug: "mit",
      description: "A world-class research university in Cambridge, Massachusetts, known for engineering and physical sciences.",
      city: "Cambridge",
      state: "MA",
      country: "USA",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1024px-MIT_logo.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.mit.edu",
      rankings: { usNews: 1, forbes: 2, timesHigherEd: 3 },
      type: "Private",
      classification: "Research University",
      setting: "Urban",
      campusSizeAcres: 168,
      acceptanceRate: 0.04,
      minGpa: 3.9,
      avgGpa: 4.17,
      satMath25: 780,
      satMath75: 800,
      satVerbal25: 730,
      satVerbal75: 780,
      actComposite25: 35,
      actComposite75: 36,
      avgSatScore: 1545,
      tuitionInState: 57986,
      tuitionOutState: 57986,
      roomAndBoard: 18790,
      costOfLiving: 2000,
      percentReceivingAid: 0.58,
      averageGrantAid: 53000,
      studentPopulation: 11934,
      undergraduatePopulation: 4638,
      studentFacultyRatio: 3,
      percentMale: 0.51,
      percentFemale: 0.49,
      graduationRate: 0.95,
      employmentRate: 0.94,
      averageStartingSalary: 95000,
      popularMajors: ["Computer Science", "Mechanical Engineering", "Mathematics", "Physics"],
      studentLifeScore: 4.5,
      partySceneRating: 3.0,
      safetyRating: 4.8,
    },
    {
      name: "Stanford University",
      slug: "stanford",
      description: "A private research university in Stanford, California, known for its entrepreneurial spirit and proximity to Silicon Valley.",
      city: "Stanford",
      state: "CA",
      country: "USA",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1024px-Seal_of_Leland_Stanford_Junior_University.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.stanford.edu",
      rankings: { usNews: 3, forbes: 1, timesHigherEd: 4 },
      type: "Private",
      classification: "Research University",
      setting: "Suburban",
      campusSizeAcres: 8180,
      acceptanceRate: 0.039,
      minGpa: 3.9,
      avgGpa: 3.96,
      satMath25: 750,
      satMath75: 800,
      satVerbal25: 720,
      satVerbal75: 770,
      actComposite25: 34,
      actComposite75: 36,
      avgSatScore: 1520,
      tuitionInState: 56169,
      tuitionOutState: 56169,
      roomAndBoard: 17255,
      costOfLiving: 3000,
      percentReceivingAid: 0.70,
      averageGrantAid: 62000,
      studentPopulation: 17680,
      undergraduatePopulation: 7645,
      studentFacultyRatio: 5,
      percentMale: 0.50,
      percentFemale: 0.50,
      graduationRate: 0.94,
      employmentRate: 0.94,
      averageStartingSalary: 90000,
      popularMajors: ["Computer Science", "Biology", "Engineering", "Economics"],
      studentLifeScore: 4.8,
      partySceneRating: 4.0,
      safetyRating: 4.5,
    },
    {
      name: "University of Oxford",
      slug: "oxford",
      description: "The oldest university in the English-speaking world, located in Oxford, England.",
      city: "Oxford",
      state: "Oxfordshire",
      country: "UK",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1024px-Oxford-University-Circlet.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.ox.ac.uk",
      rankings: { usNews: 5, forbes: 4, timesHigherEd: 1 },
      type: "Public",
      classification: "Research University",
      setting: "Urban",
      campusSizeAcres: 250,
      acceptanceRate: 0.17,
      minGpa: 3.7,
      avgGpa: 3.9,
      avgSatScore: 1470,
      tuitionInState: 12000,
      tuitionOutState: 45000, // International
      roomAndBoard: 15000,
      costOfLiving: 12000,
      percentReceivingAid: 0.40,
      averageGrantAid: 20000,
      studentPopulation: 24000,
      undergraduatePopulation: 12000,
      studentFacultyRatio: 11,
      graduationRate: 0.98,
      employmentRate: 0.91,
      averageStartingSalary: 75000,
      popularMajors: ["Philosophy", "Politics", "Economics", "Law"],
      studentLifeScore: 4.2,
      partySceneRating: 3.5,
      safetyRating: 4.9,
    },
    {
      name: "University of Toronto",
      slug: "toronto",
      description: "A public research university in Toronto, Ontario, Canada, located on the grounds that surround Queen's Park.",
      city: "Toronto",
      state: "ON",
      country: "Canada",
      logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coa.svg/1024px-Utoronto_coa.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1626125345510-4603468ee534?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.utoronto.ca",
      rankings: { usNews: 21, forbes: 25, timesHigherEd: 18 },
      type: "Public",
      classification: "Research University",
      setting: "Urban",
      campusSizeAcres: 180,
      acceptanceRate: 0.43,
      minGpa: 3.5,
      avgGpa: 3.7,
      avgSatScore: 1350,
      tuitionInState: 7500,
      tuitionOutState: 45000, // International
      roomAndBoard: 15000,
      costOfLiving: 15000,
      percentReceivingAid: 0.65,
      averageGrantAid: 12000,
      studentPopulation: 95000,
      undergraduatePopulation: 75000,
      studentFacultyRatio: 18,
      graduationRate: 0.78,
      employmentRate: 0.87,
      averageStartingSalary: 65000,
      popularMajors: ["Psychology", "Computer Science", "Commerce", "Engineering"],
      studentLifeScore: 4.0,
      partySceneRating: 4.0,
      safetyRating: 4.2,
    }
  ]

  for (const uni of universities) {
    await prisma.university.create({ data: uni })
  }
  console.log(`🏫 Created ${universities.length} universities`)

  // 4. Create Categories & Articles
  const categories = [
    { name: "Admissions", slug: "admissions", description: "Guides on getting in." },
    { name: "Student Life", slug: "student-life", description: "Campus culture and tips." },
    { name: "Financial Aid", slug: "financial-aid", description: "Scholarships and budgeting." },
  ]

  const createdCategories = await Promise.all(
    categories.map(c => prisma.category.create({ data: c }))
  )

  const articles = [
    {
      title: "How to Choose the Right University",
      slug: "how-to-choose-right-university",
      excerpt: "A comprehensive guide to help you make informed decisions when choosing the right university for your academic journey.",
      content: "<h2>Introduction</h2><p>Choosing the right university is one of the most important decisions you'll make...</p>",
      categoryId: createdCategories[0].id,
      authorId: user.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      featuredImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800"
    },
    {
      title: "Top 10 Engineering Fields with Best Career Prospects",
      slug: "top-10-engineering-fields",
      excerpt: "Explore the top 10 engineering fields with the best career prospects, salary potential, and growth opportunities.",
      content: "<h2>Introduction</h2><p>Engineering is one of the most versatile and rewarding career paths...</p>",
      categoryId: createdCategories[0].id,
      authorId: user.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      featuredImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
    },
    {
      title: "Scholarships for International Students",
      slug: "scholarships-international-students",
      excerpt: "Discover where to find scholarships for international students and learn how to increase your chances.",
      content: "<h2>Introduction</h2><p>Finding scholarships can significantly reduce the financial burden...</p>",
      categoryId: createdCategories[2].id,
      authorId: user.id,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      featuredImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
    }
  ]

  for (const article of articles) {
    await prisma.article.create({ data: article })
  }
  console.log(`📝 Created ${articles.length} articles`)

  // 5. Create a Review
  const mit = await prisma.university.findUnique({ where: { slug: 'mit' } })
  if (mit) {
    await prisma.review.create({
      data: {
        userId: user.id,
        universityId: mit.id,
        rating: 5,
        academicRating: 5,
        campusRating: 4,
        socialRating: 3,
        careerRating: 5,
        title: "Intense but rewarding",
        content: "MIT is exactly as hard as they say it is, but the opportunities are endless. The people you meet here will change the world.",
        status: ReviewStatus.APPROVED,
      }
    })
    console.log("⭐ Created sample review for MIT")
  }

  console.log('✅ Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
