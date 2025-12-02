import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class UniversityService {
  static async getAll(filters: any) {
    const { q, search, country, maxTuition, minGpa, climate, setting, major, page = 1 } = filters;
    const where: any = {};

    // Support both 'q' and 'search' parameters
    const searchTerm = q || search;
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    if (country) {
      where.country = country;
    }
    if (maxTuition !== undefined) {
      // Use AND with nested OR for tuition fields
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { tuitionOutState: { lte: Number(maxTuition) } },
            { tuitionInternational: { lte: Number(maxTuition) } },
          ],
        },
      ];
    }
    if (minGpa !== undefined) {
      where.minGpa = { lte: Number(minGpa) };
    }
    if (climate) {
      where.climate = climate;
    }
    if (setting) {
      where.setting = setting;
    }
    if (major) {
      where.majors = { has: major };
    }

    const take = 20;
    const skip = (Number(page) - 1) * take;

    return prisma.university.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    });
  }

  static async getBySlug(slug: string) {
    const university = await prisma.university.findUnique({ where: { slug } });
    if (!university) throw new AppError(404, 'University not found');
    return university;
  }
}
