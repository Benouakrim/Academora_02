import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class UniversityService {
  static async getAll(filters: any) {
    const { q, country, maxTuition, minGpa, page = 1 } = filters;
    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (country) {
      where.country = country;
    }
    if (maxTuition !== undefined) {
      where.tuitionOutState = { lte: Number(maxTuition) };
    }
    if (minGpa !== undefined) {
      where.minGpa = { lte: Number(minGpa) };
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
