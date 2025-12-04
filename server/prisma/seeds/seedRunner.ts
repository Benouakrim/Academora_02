import { PrismaClient } from '@prisma/client'

export interface SeedFunction {
  name: string
  seed: (prisma: PrismaClient, data?: any) => Promise<any>
  dependencies?: string[]
}

export class SeedRunner {
  private prisma: PrismaClient
  private seeds: Map<string, SeedFunction>
  private executedSeeds: Set<string>
  private seedData: Map<string, any>

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.seeds = new Map()
    this.executedSeeds = new Set()
    this.seedData = new Map()
  }

  register(seedFunction: SeedFunction) {
    this.seeds.set(seedFunction.name, seedFunction)
  }

  async runAll() {
    console.log('🌱 Running all seeds...\n')
    for (const [name, seedFn] of this.seeds) {
      await this.runSeed(name)
    }
  }

  async runOnly(seedNames: string[]) {
    console.log(`🌱 Running selected seeds: ${seedNames.join(', ')}\n`)
    for (const name of seedNames) {
      await this.runSeed(name)
    }
  }

  private async runSeed(name: string): Promise<any> {
    if (this.executedSeeds.has(name)) {
      return this.seedData.get(name)
    }

    const seedFn = this.seeds.get(name)
    if (!seedFn) {
      throw new Error(`Seed "${name}" not found`)
    }

    // Run dependencies first
    const dependencyData: any = {}
    if (seedFn.dependencies && seedFn.dependencies.length > 0) {
      for (const dep of seedFn.dependencies) {
        dependencyData[dep] = await this.runSeed(dep)
      }
    }

    console.log(`📦 Seeding ${name}...`)
    const result = await seedFn.seed(this.prisma, dependencyData)
    this.executedSeeds.add(name)
    this.seedData.set(name, result)
    console.log(`   ✅ ${name} completed\n`)
    
    return result
  }

  async clean() {
    console.log('🧹 Cleaning database...')
    
    // Order matters due to foreign key constraints
    await this.prisma.userBadge.deleteMany()
    await this.prisma.badge.deleteMany()
    await this.prisma.referral.deleteMany()
    await this.prisma.universityClaim.deleteMany()
    await this.prisma.comment.deleteMany()
    await this.prisma.review.deleteMany()
    await this.prisma.microContent.deleteMany()
    await this.prisma.savedUniversity.deleteMany()
    await this.prisma.comparison.deleteMany()
    await this.prisma.article.deleteMany()
    await this.prisma.category.deleteMany()
    await this.prisma.tag.deleteMany()
    await this.prisma.staticPage.deleteMany()
    await this.prisma.universityGroup.deleteMany()
    await this.prisma.university.deleteMany()
    await this.prisma.financialProfile.deleteMany()
    await this.prisma.notification.deleteMany()
    await this.prisma.user.deleteMany()
    
    console.log('✅ Database cleaned\n')
  }

  async printSummary() {
    console.log('📊 Database Summary:')
    console.log(`   • Users: ${await this.prisma.user.count()}`)
    console.log(`   • Universities: ${await this.prisma.university.count()}`)
    console.log(`   • Articles: ${await this.prisma.article.count()}`)
    console.log(`   • Categories: ${await this.prisma.category.count()}`)
    console.log(`   • Tags: ${await this.prisma.tag.count()}`)
    console.log(`   • Reviews: ${await this.prisma.review.count()}`)
    console.log(`   • University Claims: ${await this.prisma.universityClaim.count()}`)
    console.log(`   • Referrals: ${await this.prisma.referral.count()}`)
    console.log(`   • Badges: ${await this.prisma.badge.count()}`)
    console.log(`   • User Badges: ${await this.prisma.userBadge.count()}`)
    console.log(`   • Saved Universities: ${await this.prisma.savedUniversity.count()}`)
  }
}
