import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import * as cache from '../lib/cache';
import prisma from '../lib/prisma';

export class UniversityService {
  // --- Read ---
  static async getAll(filters: any) {
    // Create cache key from filters
    const cacheKey = `universities:all:${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[Cache HIT] Universities list');
      return cached;
    }
    
    const { 
      q, country, maxTuition, minGpa, climateZone, setting, minSafetyRating, minPartySceneRating,
      minAcceptanceRate, minAvgSat, requiredIelts, // NEW FILTERS
      page = 1, pageSize = 20 
    } = filters;
    
    const where: Prisma.UniversityWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (country && country !== 'all') {
      where.country = { equals: country, mode: 'insensitive' };
    }
    if (maxTuition) {
      where.tuitionOutState = { lte: Number(maxTuition) };
    }
    if (minGpa) {
      where.minGpa = { lte: Number(minGpa) };
    }
    if (climateZone) {
      where.climateZone = { equals: climateZone, mode: 'insensitive' };
    }
    if (setting) {
      where.setting = setting as any; // CampusSetting enum
    }
    if (minSafetyRating) {
      where.safetyRating = { gte: Number(minSafetyRating) };
    }
    if (minPartySceneRating) {
      where.partySceneRating = { gte: Number(minPartySceneRating) };
    }
    
    // --- NEW FILTER LOGIC ---
    if (minAcceptanceRate) {
        // Find schools with acceptance rate <= requested maximum (note the filter name is minAcceptanceRate, meaning highest accepted rate)
        where.acceptanceRate = { lte: Number(minAcceptanceRate) };
    }
    if (minAvgSat) {
        // Find schools where AVG SAT is greater than or equal to the minimum requested
        where.avgSatScore = { gte: Number(minAvgSat) };
    }
    if (requiredIelts) {
        // Query JSONB field: internationalEngReqs -> ielts value
        // The query is complex for relational DBs and should be benchmarked.
        // Prisma documentation suggests JSON filtering can be done as follows:
        where.internationalEngReqs = {
            path: ['ielts'],
            // Find records where internationalEngReqs.ielts >= requiredIelts (as a number)
            gte: Number(requiredIelts)
        } as any;
    }
    // --- END NEW FILTER LOGIC ---

    const take = Number(pageSize);
    const skip = (Number(page) - 1) * take;

    const [articles, total] = await Promise.all([
      prisma.university.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        // Select only necessary fields for the search card
        select: {
          id: true, slug: true, name: true, city: true, state: true, country: true, 
          logoUrl: true, heroImageUrl: true, acceptanceRate: true, tuitionOutState: true, 
          tuitionInternational: true, studentLifeScore: true, rankings: true,
        }
      }),
      prisma.university.count({ where })
    ]);

    const result = { data: articles, meta: { total, page, pageSize } };
    
    // Cache with short TTL (1 minute) since search results aggregate many data points
    cache.set(cacheKey, result, cache.TTL_SHORT);
    console.log('[Cache MISS] Universities list - cached for 1 minute');
    
    return result;
  }

  static async getBySlug(slug: string) {
    // Create cache key
    const cacheKey = `university:slug:${slug}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] University: ${slug}`);
      return cached;
    }
    
    const university = await prisma.university.findUnique({ where: { slug } });
    if (!university) throw new AppError(404, 'University not found');
    
    // Cache with long TTL (5 minutes) since university profiles change infrequently
    cache.set(cacheKey, university, cache.TTL_LONG);
    console.log(`[Cache MISS] University: ${slug} - cached for 5 minutes`);
    
    return university;
  }

  static async getById(id: string) {
    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) throw new AppError(404, 'University not found');
    return university;
  }

  // --- Write ---
  static async create(data: Prisma.UniversityCreateInput) {
    // Ensure slug uniqueness
    const existing = await prisma.university.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError(409, 'University with this slug already exists');

    const university = await prisma.university.create({ data });
    
    // Invalidate list cache on create
    cache.clear();
    console.log('[Cache] Cleared all cache after university creation');
    
    return university;
  }

  static async update(id: string, data: Prisma.UniversityUpdateInput) {
    try {
      const university = await prisma.university.update({
        where: { id },
        data,
      });
      
      // Invalidate cache for this university and all lists
      cache.clear();
      console.log('[Cache] Cleared all cache after university update');
      
      return university;
    } catch (err: any) {
      if (err.code === 'P2025') throw new AppError(404, 'University not found');
      throw err;
    }
  }

  static async delete(id: string) {
    try {
      const university = await prisma.university.delete({ where: { id } });
      
      // Invalidate cache on delete
      cache.clear();
      console.log('[Cache] Cleared all cache after university deletion');
      
      return university;
    } catch (err: any) {
      if (err.code === 'P2025') throw new AppError(404, 'University not found');
      throw err;
    }
  }
}
