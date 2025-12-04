import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const financialProfilesSeed: SeedFunction = {
  name: 'financialProfiles',
  dependencies: ['users'],
  seed: async (prisma: PrismaClient, data: any) => {
    const { student1 } = data.users

    await prisma.financialProfile.create({
      data: {
        userId: student1.id,
        maxBudget: 50000,
        householdIncome: 120000,
        familySize: 4,
        savings: 30000,
        investments: 15000,
        expectedFamilyContribution: 25000,
        eligibleForPellGrant: false,
        eligibleForStateAid: true,
      }
    })

    return true
  }
}
