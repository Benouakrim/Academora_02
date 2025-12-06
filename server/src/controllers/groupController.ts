// server/src/controllers/groupController.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

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
