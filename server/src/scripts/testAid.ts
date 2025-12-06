import { PrismaClient } from '@prisma/client';
import { FinancialAidService } from '../services/FinancialAidService';

async function main() {
  const prisma = new PrismaClient();
  try {
    const uni = await prisma.university.upsert({
      where: { slug: 'test-uni-aid' },
      update: {},
      create: {
        slug: 'test-uni-aid',
        name: 'Test University',
        city: 'Test City',
        country: 'USA',
        tuitionInState: 25000,
        tuitionOutState: 40000,
        roomAndBoard: 12000,
        costOfLiving: 3000,
        avgGpa: 3.5,
        avgSatScore: 1200,
        percentReceivingAid: 0.6,
        averageGrantAid: 15000,
        popularMajors: ['Computer Science'],
      },
    });

    const result = await FinancialAidService.predict({
      universityId: uni.id,
      familyIncome: 85000,
      gpa: 3.7,
      satScore: 1350,
      residency: 'in-state',
    });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
