import { PrismaClient } from '@prisma/client'
import { 
  SeedRunner,
  usersSeed,
  financialProfilesSeed,
  taxonomiesSeed,
  universitiesSeed,
  universityGroupsSeed,
  microContentSeed,
  articlesSeed,
  universityClaimsSeed,
  referralsSeed,
  badgesSeed,
  reviewsSeed,
  savedUniversitiesSeed
} from './seeds'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...\n')

  const runner = new SeedRunner(prisma)

  // Register all seeds
  runner.register(usersSeed)
  runner.register(financialProfilesSeed)
  runner.register(taxonomiesSeed)
  runner.register(universitiesSeed)
  runner.register(universityGroupsSeed)
  runner.register(microContentSeed)
  runner.register(articlesSeed)
  runner.register(universityClaimsSeed)
  runner.register(referralsSeed)
  runner.register(badgesSeed)
  runner.register(reviewsSeed)
  runner.register(savedUniversitiesSeed)

  // Clean the database
  await runner.clean()

  // Get seed selection from command line arguments
  const args = process.argv.slice(2)
  
  if (args.length > 0 && args[0] === '--seed') {
    // Run specific seeds
    const seedNames = args.slice(1)
    if (seedNames.length === 0) {
      console.log('❌ Please specify seed names after --seed')
      console.log('Available seeds:')
      console.log('  - users')
      console.log('  - financialProfiles')
      console.log('  - taxonomies')
      console.log('  - universities')
      console.log('  - universityGroups')
      console.log('  - microContent')
      console.log('  - articles')
      console.log('  - universityClaims')
      console.log('  - referrals')
      console.log('  - badges')
      console.log('  - reviews')
      console.log('  - savedUniversities')
      process.exit(1)
    }
    await runner.runOnly(seedNames)
  } else {
    // Run all seeds
    await runner.runAll()
  }

  // Print summary
  console.log('✅ Seeding complete!\n')
  await runner.printSummary()
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
