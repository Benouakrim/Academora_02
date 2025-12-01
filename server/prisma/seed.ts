import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const universities = [
  {
    name: "Massachusetts Institute of Technology",
    slug: "mit",
    description: "A world-class research university in Cambridge, Massachusetts, known for engineering and physical sciences.",
    city: "Cambridge",
    state: "MA",
    country: "USA",
    ranking: 1,
    acceptanceRate: 0.04,
    minGpa: 3.9,
    avgSatScore: 1540,
    tuitionOutState: 57000,
    popularMajors: ["Computer Science", "Engineering", "Mathematics", "Physics"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1024px-MIT_logo.svg.png"
  },
  {
    name: "Stanford University",
    slug: "stanford",
    description: "A private research university in Stanford, California, known for its entrepreneurial spirit and proximity to Silicon Valley.",
    city: "Stanford",
    state: "CA",
    country: "USA",
    ranking: 3,
    acceptanceRate: 0.04,
    minGpa: 3.9,
    avgSatScore: 1520,
    tuitionOutState: 56000,
    popularMajors: ["Computer Science", "Biology", "Economics", "Engineering"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1024px-Seal_of_Leland_Stanford_Junior_University.svg.png"
  },
  {
    name: "University of Oxford",
    slug: "oxford",
    description: "The oldest university in the English-speaking world, located in Oxford, England.",
    city: "Oxford",
    state: "Oxfordshire",
    country: "UK",
    ranking: 2,
    acceptanceRate: 0.17,
    minGpa: 3.7,
    avgSatScore: null,
    tuitionOutState: 40000,
    popularMajors: ["Philosophy", "Politics", "Economics", "History"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1024px-Oxford-University-Circlet.svg.png"
  },
  {
    name: "University of Toronto",
    slug: "toronto",
    description: "A public research university in Toronto, Ontario, Canada, located on the grounds that surround Queen's Park.",
    city: "Toronto",
    state: "ON",
    country: "Canada",
    ranking: 21,
    acceptanceRate: 0.43,
    minGpa: 3.5,
    avgSatScore: null,
    tuitionOutState: 45000,
    popularMajors: ["Psychology", "Medical Science", "Commerce", "Engineering"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coa.svg/1024px-Utoronto_coa.svg.png"
  },
  {
    name: "Sorbonne University",
    slug: "sorbonne",
    description: "A public research university in Paris, France, famous for its humanities and science programs.",
    city: "Paris",
    state: "Ile-de-France",
    country: "France",
    ranking: 60,
    acceptanceRate: 0.20,
    minGpa: 3.0,
    avgSatScore: null,
    tuitionOutState: 3000,
    popularMajors: ["Arts", "Humanities", "Science", "Medicine"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Sorbonne_Universit%C3%A9_logo.svg/1024px-Sorbonne_Universit%C3%A9_logo.svg.png"
  }
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Cleanup
  await prisma.savedUniversity.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.university.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Universities
  for (const uni of universities) {
    await prisma.university.create({ data: uni });
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
