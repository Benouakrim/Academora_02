/**
 * Benchmark Service
 * Manages loading benchmarks from database with fallback to hardcoded defaults
 */

import { INDUSTRY_BENCHMARKS } from './benchmarks'
import type { IndustryBenchmarks } from './benchmarks'

class BenchmarkService {
  private cachedBenchmarks: IndustryBenchmarks | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in ms

  /**
   * Get benchmarks from database or fallback to hardcoded defaults
   * Currently uses hardcoded defaults. Future: integrate with SystemBenchmark DB model after migration
   */
  async getBenchmarks(): Promise<IndustryBenchmarks> {
    const now = Date.now()
    
    // Return cached benchmarks if still valid
    if (this.cachedBenchmarks && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cachedBenchmarks
    }

    try {
      // TODO: Once SystemBenchmark table is migrated, replace with:
      // const dbBenchmarks = await prisma.systemBenchmark.findMany()
      // if (dbBenchmarks.length === 0) {
      //   return INDUSTRY_BENCHMARKS
      // }
      // const categories: Record<string, any> = {}
      // for (const bench of dbBenchmarks) {
      //   categories[bench.category] = {
      //     category: bench.category,
      //     rpm: bench.rpm,
      //     avgSearchVolume: bench.avgSearchVolume,
      //     avgCTR: bench.avgCTR,
      //     seasonalMultiplier: bench.seasonalMultiplier,
      //     competitionLevel: bench.competitionLevel,
      //   }
      // }
      // const result: any = {
      //   categories: Object.keys(categories).length > 0 ? categories : INDUSTRY_BENCHMARKS.categories,
      //   defaults: INDUSTRY_BENCHMARKS.defaults,
      //   qualityMultipliers: INDUSTRY_BENCHMARKS.qualityMultipliers,
      // }
      // this.cachedBenchmarks = result
      // this.cacheTimestamp = now
      // return result
      
      // Use hardcoded defaults
      this.cachedBenchmarks = INDUSTRY_BENCHMARKS
      this.cacheTimestamp = now
      return INDUSTRY_BENCHMARKS
    } catch (error) {
      console.warn('Failed to fetch benchmarks from database, using hardcoded defaults', error)
      return INDUSTRY_BENCHMARKS
    }
  }

  /**
   * Clear the cache to force refresh on next getBenchmarks call
   */
  clearCache(): void {
    this.cachedBenchmarks = null
    this.cacheTimestamp = 0
  }

  /**
   * Initialize database with default benchmarks if empty
   * TODO: Implement after SystemBenchmark table is migrated
   */
  async initializeDefaults(): Promise<void> {
    console.log('Benchmarks initialized from hardcoded defaults')
    // TODO: Once DB is ready:
    // const count = await prisma.systemBenchmark.count()
    // if (count === 0) {
    //   const defaults = Object.values(INDUSTRY_BENCHMARKS.categories)
    //   await prisma.systemBenchmark.createMany({
    //     data: defaults.map(b => ({
    //       category: b.category,
    //       rpm: b.rpm,
    //       avgSearchVolume: b.avgSearchVolume,
    //       avgCTR: b.avgCTR,
    //       seasonalMultiplier: b.seasonalMultiplier,
    //       competitionLevel: b.competitionLevel,
    //     })),
    //   })
    //   this.clearCache()
    // }
  }
}

export default new BenchmarkService()
