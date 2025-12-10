// server/src/controllers/groupController.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';
import { GroupMetricsCalculator } from '../services/groupMetricsCalculator';

// GET / - Get all groups with member count
export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.universityGroup.findMany({
      include: {
        _count: {
          select: { universities: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ status: 'success', data: groups });
  } catch (err) {
    next(err);
  }
};

// GET /:id - Get group by ID with universities
export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const group = await prisma.universityGroup.findUnique({
      where: { id },
      include: {
        universities: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            logoUrl: true,
            tuitionOutState: true,
            acceptanceRate: true,
          }
        }
      }
    });

    if (!group) {
      return next(new AppError(404, 'University group not found'));
    }

    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

// GET /slug/:slug - Get group by slug with universities
export const getGroupBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const group = await prisma.universityGroup.findUnique({
      where: { slug },
      include: {
        universities: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            country: true,
            logoUrl: true,
            tuitionOutState: true,
            acceptanceRate: true,
            studentPopulation: true,
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!group) {
      return next(new AppError(404, 'University group not found'));
    }

    // Calculate dynamic metrics
    const calculatedMetrics = await GroupMetricsCalculator.getMetricsWithCache(group.id);

    // Get metric modes configuration
    const metricModes = (group.metricModes as Record<string, any>) || {};

    // Merge static and dynamic metrics based on mode configuration
    const mergedMetrics = GroupMetricsCalculator.mergeMetrics(
      group as any,
      calculatedMetrics,
      metricModes
    );

    // Return group with merged metrics
    const responseData = {
      ...group,
      ...mergedMetrics,
      _computed: {
        dynamicMetrics: calculatedMetrics,
        metricModes,
      }
    };

    res.status(200).json({ status: 'success', data: responseData });
  } catch (err) {
    next(err);
  }
};

// POST / - Create new group
export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, logoUrl, website, universityIds } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return next(new AppError(400, 'Name and slug are required'));
    }

    // Check if slug already exists
    const existingGroup = await prisma.universityGroup.findUnique({
      where: { slug }
    });

    if (existingGroup) {
      return next(new AppError(400, 'A group with this slug already exists'));
    }

    // Create group with optional university connections
    const group = await prisma.universityGroup.create({
      data: {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        website: website || null,
        memberCount: universityIds?.length || 0,
        universities: universityIds?.length > 0 ? {
          connect: universityIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        _count: {
          select: { universities: true }
        }
      }
    });

    res.status(201).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

// PUT /:id - Update group
export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, description, logoUrl, website, universityIds } = req.body;

    // Check if group exists
    const existingGroup = await prisma.universityGroup.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return next(new AppError(404, 'University group not found'));
    }

    // If slug is being changed, check for conflicts
    if (slug && slug !== existingGroup.slug) {
      const conflictingGroup = await prisma.universityGroup.findUnique({
        where: { slug }
      });

      if (conflictingGroup) {
        return next(new AppError(400, 'A group with this slug already exists'));
      }
    }

    // Update group
    const updatedData: any = {
      name: name || existingGroup.name,
      slug: slug || existingGroup.slug,
      description: description !== undefined ? description : existingGroup.description,
      logoUrl: logoUrl !== undefined ? logoUrl : existingGroup.logoUrl,
      website: website !== undefined ? website : existingGroup.website,
    };

    // Handle university membership updates
    if (universityIds !== undefined) {
      updatedData.universities = {
        set: universityIds.map((id: string) => ({ id }))
      };
      updatedData.memberCount = universityIds.length;
      
      // Invalidate cache when universities change
      await GroupMetricsCalculator.invalidateCache(id);
    }

    const group = await prisma.universityGroup.update({
      where: { id },
      data: updatedData,
      include: {
        _count: {
          select: { universities: true }
        }
      }
    });

    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

// DELETE /:id - Delete group
export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const existingGroup = await prisma.universityGroup.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return next(new AppError(404, 'University group not found'));
    }

    // Delete the group (universities won't be deleted, just the relationship)
    await prisma.universityGroup.delete({
      where: { id }
    });

    res.status(200).json({ status: 'success', message: 'Group deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /:id/metric-modes - Update metric mode configuration
export const updateMetricModes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { metricModes } = req.body;

    // Validate that metricModes is an object
    if (!metricModes || typeof metricModes !== 'object') {
      return next(new AppError(400, 'Invalid metric modes configuration'));
    }

    // Validate that all values are either 'static' or 'dynamic'
    const validModes = ['static', 'dynamic'];
    for (const [key, value] of Object.entries(metricModes)) {
      if (!validModes.includes(value as string)) {
        return next(new AppError(400, `Invalid mode "${value}" for metric "${key}". Must be "static" or "dynamic"`));
      }
    }

    const group = await prisma.universityGroup.update({
      where: { id },
      data: { 
        metricModes: metricModes as any,
        updatedAt: new Date(),
      },
    });

    // Invalidate cache when modes change
    await GroupMetricsCalculator.invalidateCache(id);

    res.status(200).json({ 
      status: 'success', 
      data: { 
        metricModes: group.metricModes,
        message: 'Metric modes updated successfully'
      } 
    });
  } catch (err) {
    next(err);
  }
};

// POST /:id/recalculate - Force recalculate metrics
export const recalculateMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const group = await prisma.universityGroup.findUnique({
      where: { id }
    });

    if (!group) {
      return next(new AppError(404, 'University group not found'));
    }

    // Invalidate cache and recalculate
    await GroupMetricsCalculator.invalidateCache(id);
    const calculatedMetrics = await GroupMetricsCalculator.calculateMetrics(id);
    await GroupMetricsCalculator.updateCache(id, calculatedMetrics);

    res.status(200).json({ 
      status: 'success', 
      data: {
        calculatedMetrics,
        message: 'Metrics recalculated successfully'
      }
    });
  } catch (err) {
    next(err);
  }
};
