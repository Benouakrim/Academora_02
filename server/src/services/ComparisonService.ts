import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export interface SaveComparisonRequest {
  name: string;
  description?: string;
  universityIds: string[];
}

export class ComparisonService {
  /**
   * Save a new comparison for a user
   */
  static async saveComparison(
    userId: string,
    data: SaveComparisonRequest
  ) {
    const { name, description, universityIds } = data;

    // Validate
    if (!name || name.trim().length === 0) {
      throw new AppError(400, 'Comparison name is required');
    }

    if (!universityIds || universityIds.length < 2) {
      throw new AppError(400, 'At least 2 universities are required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities can be compared');
    }

    // Verify all universities exist
    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
      select: { id: true },
    });

    if (universities.length !== universityIds.length) {
      throw new AppError(400, 'One or more universities not found');
    }

    // Create comparison
    const comparison = await prisma.comparison.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        userId,
        universityIds,
      },
    });

    return comparison;
  }

  /**
   * Get all saved comparisons for a user
   */
  static async getUserComparisons(userId: string) {
    const comparisons = await prisma.comparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with university data
    const enriched = await Promise.all(
      comparisons.map(async (comparison) => {
        const universities = await prisma.university.findMany({
          where: { id: { in: comparison.universityIds } },
          select: {
            id: true,
            slug: true,
            name: true,
            shortName: true,
            logoUrl: true,
            city: true,
            country: true,
          },
        });

        return {
          ...comparison,
          universities,
        };
      })
    );

    return enriched;
  }

  /**
   * Get a specific comparison by ID
   */
  static async getComparisonById(comparisonId: string, userId: string) {
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
    });

    if (!comparison) {
      throw new AppError(404, 'Comparison not found');
    }

    // Verify ownership
    if (comparison.userId !== userId) {
      throw new AppError(403, 'Unauthorized to access this comparison');
    }

    // Fetch full university data
    const universities = await prisma.university.findMany({
      where: { id: { in: comparison.universityIds } },
    });

    return {
      ...comparison,
      universities,
    };
  }

  /**
   * Delete a comparison
   */
  static async deleteComparison(comparisonId: string, userId: string) {
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
    });

    if (!comparison) {
      throw new AppError(404, 'Comparison not found');
    }

    // Verify ownership
    if (comparison.userId !== userId) {
      throw new AppError(403, 'Unauthorized to delete this comparison');
    }

    await prisma.comparison.delete({
      where: { id: comparisonId },
    });

    return { success: true };
  }

  /**
   * Update a comparison
   */
  static async updateComparison(
    comparisonId: string,
    userId: string,
    data: Partial<SaveComparisonRequest>
  ) {
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
    });

    if (!comparison) {
      throw new AppError(404, 'Comparison not found');
    }

    // Verify ownership
    if (comparison.userId !== userId) {
      throw new AppError(403, 'Unauthorized to update this comparison');
    }

    // Validate university IDs if provided
    if (data.universityIds) {
      if (data.universityIds.length < 2 || data.universityIds.length > 5) {
        throw new AppError(400, 'Must have between 2 and 5 universities');
      }

      const universities = await prisma.university.findMany({
        where: { id: { in: data.universityIds } },
        select: { id: true },
      });

      if (universities.length !== data.universityIds.length) {
        throw new AppError(400, 'One or more universities not found');
      }
    }

    // Update
    const updated = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() }),
        ...(data.universityIds && { universityIds: data.universityIds }),
      },
    });

    return updated;
  }
}
