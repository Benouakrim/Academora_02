import { PrismaClient, UserRole, InstitutionType, CampusSetting, TestPolicy, AcademicCalendar, ReviewStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Clean up existing data (Order matters due to foreign key constraints)
  const cleanup = [
    prisma.comment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.savedUniversity.deleteMany(),
    prisma.comparison.deleteMany(),
    prisma.article.deleteMany(),
    prisma.category.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.university.deleteMany(),
    prisma.user.deleteMany(),
  ]
  
  await prisma.$transaction(cleanup)
  console.log('🧹 Database cleaned')

  // 2. Create Default Admin User
  const adminUser = await prisma.user.create({
    data: {
      clerkId: "user_admin_demo_id", // Replace with valid ID in development
      email: "admin@academora.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      gpa: 4.0,
      maxBudget: 50000,
      preferredMajor: "Computer Science",
      careerGoals: ["Software Engineer", "Entrepreneur"],
      hobbies: ["Coding", "Chess"],
    }
  })
  console.log(`👤 Created admin: ${adminUser.email}`)

  // 3. Seed CMS Content (Categories & Tags)
  const categories = [
    { name: "Admissions Guides", slug: "admissions", description: "Tips for getting accepted." },
    { name: "Student Life", slug: "student-life", description: "Campus culture and housing." },
    { name: "Financial Aid", slug: "financial-aid", description: "Scholarships and loans." },
    { name: "Visa & Immigration", slug: "visa-immigration", description: "International student advice." },
  ]

  const tags = [
    { name: "Engineering", slug: "engineering" },
    { name: "Ivy League", slug: "ivy-league" },
    { name: "Public Ivy", slug: "public-ivy" },
    { name: "Study Abroad", slug: "study-abroad" },
  ]

  await Promise.all(categories.map(c => prisma.category.create({ data: c })))
  await Promise.all(tags.map(t => prisma.tag.create({ data: t })))
  console.log(`📚 Created CMS structure`)

  // 4. Seed University Data
  const universities = [
    {
      name: "Massachusetts Institute of Technology",
      slug: "mit",
      shortName: "MIT",
      description: "A world-class research university in Cambridge, Massachusetts, known for engineering and physical sciences.",
      city: "Cambridge",
      state: "MA",
      country: "USA",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1024px-MIT_logo.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.mit.edu",
      established: 1861,
      
      // Location Metadata
      climateZone: "Temperate",
      nearestAirport: "Boston Logan (BOS)",
      setting: CampusSetting.URBAN,
      campusSizeAcres: 168,
      
      // Classification
      type: InstitutionType.PRIVATE_NON_PROFIT,
      classification: "Research University",
      
      // Admissions
      acceptanceRate: 0.04,
      applicationFee: 75,
      commonAppAccepted: true,
      testPolicy: TestPolicy.REQUIRED,
      minGpa: 3.8,
      avgGpa: 4.17,
      satMath25: 780, satMath75: 800,
      satVerbal25: 730, satVerbal75: 780,
      actComposite25: 35, actComposite75: 36,
      avgSatScore: 1545,
      internationalEngReqs: { toefl: 100, ielts: 7.5 },

      // Financials
      tuitionInState: 57986,
      tuitionOutState: 57986,
      tuitionInternational: 57986,
      roomAndBoard: 18790,
      costOfLiving: 2000,
      percentReceivingAid: 0.58,
      averageGrantAid: 53000,
      averageNetPrice: 15000,
      needBlindAdmission: true,
      scholarshipsIntl: true,

      // Demographics
      studentPopulation: 11934,
      undergraduatePopulation: 4638,
      studentFacultyRatio: 3,
      percentMale: 0.51,
      percentFemale: 0.49,
      percentInternational: 0.33,
      diversityScore: 0.85,

      // Outcomes
      graduationRate: 0.95,
      retentionRate: 0.98,
      employmentRate: 0.94,
      averageStartingSalary: 95000,
      internshipSupport: 5,
      alumniNetwork: 5,
      visaDurationMonths: 36,

      // Campus Life
      studentLifeScore: 4.5,
      partySceneRating: 3.0,
      safetyRating: 4.8,
      sportsDivision: "NCAA Division III",
      
      popularMajors: ["Computer Science", "Mechanical Engineering", "Mathematics", "Physics"],
      rankings: { usNews: 1, forbes: 2, qs: 1 },
    },
    {
      name: "Stanford University",
      slug: "stanford",
      shortName: "Stanford",
      description: "Located in the heart of Silicon Valley, Stanford is known for its entrepreneurial spirit and academic excellence.",
      city: "Stanford",
      state: "CA",
      country: "USA",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1024px-Seal_of_Leland_Stanford_Junior_University.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.stanford.edu",
      established: 1885,

      climateZone: "Mediterranean",
      nearestAirport: "San Jose (SJC) / SFO",
      setting: CampusSetting.SUBURBAN,
      campusSizeAcres: 8180,

      type: InstitutionType.PRIVATE_NON_PROFIT,
      classification: "Research University",

      acceptanceRate: 0.039,
      applicationFee: 90,
      commonAppAccepted: true,
      testPolicy: TestPolicy.TEST_OPTIONAL,
      minGpa: 3.8,
      avgGpa: 3.96,
      satMath25: 750, satMath75: 800,
      satVerbal25: 720, satVerbal75: 770,
      actComposite25: 34, actComposite75: 36,
      avgSatScore: 1520,

      tuitionInState: 56169,
      tuitionOutState: 56169,
      tuitionInternational: 56169,
      roomAndBoard: 17255,
      costOfLiving: 3000,
      percentReceivingAid: 0.70,
      averageGrantAid: 62000,
      averageNetPrice: 12000,
      needBlindAdmission: true,
      scholarshipsIntl: false,

      studentPopulation: 17680,
      undergraduatePopulation: 7645,
      studentFacultyRatio: 5,
      percentMale: 0.50,
      percentFemale: 0.50,
      percentInternational: 0.24,
      
      graduationRate: 0.94,
      employmentRate: 0.94,
      averageStartingSalary: 90000,
      internshipSupport: 5,
      alumniNetwork: 5,
      visaDurationMonths: 36,

      studentLifeScore: 4.8,
      partySceneRating: 4.0,
      safetyRating: 4.5,
      sportsDivision: "NCAA Division I",

      popularMajors: ["Computer Science", "Human Biology", "Economics", "Engineering"],
      rankings: { usNews: 3, forbes: 1, qs: 3 },
    },
    {
      name: "University of Oxford",
      slug: "oxford",
      shortName: "Oxford",
      description: "The oldest university in the English-speaking world, Oxford offers a unique collegiate system and world-class tutorials.",
      city: "Oxford",
      state: "Oxfordshire",
      country: "UK",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1024px-Oxford-University-Circlet.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.ox.ac.uk",
      established: 1096,

      climateZone: "Maritime",
      nearestAirport: "London Heathrow (LHR)",
      setting: CampusSetting.URBAN,
      campusSizeAcres: 250,

      type: InstitutionType.PUBLIC,
      classification: "Research University",
      academicCalendar: AcademicCalendar.TRIMESTER,

      acceptanceRate: 0.17,
      applicationFee: 25,
      commonAppAccepted: false,
      testPolicy: TestPolicy.REQUIRED,
      minGpa: 3.7,
      avgGpa: 3.9,
      avgSatScore: 1470,
      internationalEngReqs: { ielts: 7.5 },

      tuitionInState: 12000,
      tuitionOutState: 45000,
      tuitionInternational: 45000,
      roomAndBoard: 15000,
      costOfLiving: 12000,
      percentReceivingAid: 0.40,
      averageGrantAid: 20000,
      averageNetPrice: 35000,
      needBlindAdmission: false,
      scholarshipsIntl: true,

      studentPopulation: 24000,
      undergraduatePopulation: 12000,
      studentFacultyRatio: 11,
      percentMale: 0.48,
      percentFemale: 0.52,
      percentInternational: 0.45,

      graduationRate: 0.98,
      employmentRate: 0.91,
      averageStartingSalary: 75000,
      internshipSupport: 4,
      alumniNetwork: 5,
      visaDurationMonths: 24,

      studentLifeScore: 4.2,
      partySceneRating: 3.5,
      safetyRating: 4.9,

      popularMajors: ["Philosophy", "PPE", "Law", "Medicine"],
      rankings: { usNews: 5, forbes: 4, qs: 4 },
    },
    {
      name: "University of Toronto",
      slug: "toronto",
      shortName: "U of T",
      description: "Canada's top university, located in a vibrant, multicultural city with massive research output.",
      city: "Toronto",
      state: "ON",
      country: "Canada",
      logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coa.svg/1024px-Utoronto_coa.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1626125345510-4603468ee534?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.utoronto.ca",
      established: 1827,

      climateZone: "Continental",
      nearestAirport: "Toronto Pearson (YYZ)",
      setting: CampusSetting.URBAN,
      campusSizeAcres: 180,

      type: InstitutionType.PUBLIC,
      classification: "Research University",

      acceptanceRate: 0.43,
      applicationFee: 90,
      commonAppAccepted: false,
      testPolicy: TestPolicy.TEST_OPTIONAL,
      minGpa: 3.5,
      avgGpa: 3.7,
      avgSatScore: 1350,

      tuitionInState: 6100,
      tuitionOutState: 60000,
      tuitionInternational: 60000,
      roomAndBoard: 15000,
      costOfLiving: 15000,
      percentReceivingAid: 0.65,
      averageGrantAid: 12000,
      averageNetPrice: 40000,
      scholarshipsIntl: true,

      studentPopulation: 95000,
      undergraduatePopulation: 75000,
      studentFacultyRatio: 18,
      percentMale: 0.45,
      percentFemale: 0.55,
      percentInternational: 0.27,

      graduationRate: 0.78,
      employmentRate: 0.87,
      averageStartingSalary: 65000,
      internshipSupport: 4,
      alumniNetwork: 4,
      visaDurationMonths: 36,

      studentLifeScore: 4.0,
      partySceneRating: 4.0,
      safetyRating: 4.2,

      popularMajors: ["Psychology", "Computer Science", "Commerce", "Engineering"],
      rankings: { usNews: 21, qs: 25 },
    },
    {
      name: "University of Florida",
      slug: "ufl",
      shortName: "UF",
      description: "A top-ranked public university with sunny weather, strong athletics, and affordable tuition.",
      city: "Gainesville",
      state: "FL",
      country: "USA",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/University_of_Florida_logo.svg/1200px-University_of_Florida_logo.svg.png",
      heroImageUrl: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=1200&h=600&fit=crop",
      websiteUrl: "https://www.ufl.edu",
      established: 1853,

      climateZone: "Humid Subtropical",
      nearestAirport: "Gainesville (GNV)",
      setting: CampusSetting.SUBURBAN,
      campusSizeAcres: 2000,

      type: InstitutionType.PUBLIC,
      classification: "Research University",

      acceptanceRate: 0.23,
      applicationFee: 30,
      commonAppAccepted: true,
      testPolicy: TestPolicy.REQUIRED,
      minGpa: 3.8,
      avgGpa: 4.4,
      satMath25: 650, satMath75: 740,
      satVerbal25: 640, satVerbal75: 720,
      avgSatScore: 1380,

      tuitionInState: 6380,
      tuitionOutState: 28659,
      tuitionInternational: 28659,
      roomAndBoard: 10950,
      costOfLiving: 1500,
      percentReceivingAid: 0.85,
      averageGrantAid: 8000,
      averageNetPrice: 12000,
      
      studentPopulation: 57000,
      undergraduatePopulation: 41000,
      studentFacultyRatio: 16,
      percentInternational: 0.08,

      graduationRate: 0.88,
      employmentRate: 0.85,
      averageStartingSalary: 55000,
      internshipSupport: 3,
      alumniNetwork: 4,
      visaDurationMonths: 12,

      studentLifeScore: 4.7,
      partySceneRating: 4.8,
      safetyRating: 4.0,
      sportsDivision: "NCAA Division I",

      popularMajors: ["Engineering", "Business", "Biology", "Psychology"],
      rankings: { usNews: 28, qs: 150 },
    }
  ]

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { slug: uni.slug },
      update: {},
      create: uni,
    })
  }
  console.log(`🏫 Created ${universities.length} detailed universities`)

  // 5. Seed Sample Review
  const mit = await prisma.university.findUnique({ where: { slug: 'mit' } })
  if (mit) {
    await prisma.review.create({
      data: {
        userId: adminUser.id,
        universityId: mit.id,
        rating: 5,
        academicRating: 5,
        campusRating: 4,
        socialRating: 3,
        careerRating: 5,
        title: "Intense but rewarding",
        content: "MIT is exactly as hard as they say it is, but the opportunities are endless.",
        status: ReviewStatus.APPROVED,
      }
    })
    console.log("⭐ Created sample review")
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
