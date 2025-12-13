// server/src/controllers/microContentController.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';
import { UniversityBlockService } from '../services/UniversityBlockService'; // NEW IMPORT

// GET /university/:universityId - Get all micro-content for a specific university
export const getByUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityId } = req.params;

    // Verify university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId }
    });

    if (!university) {
      return next(new AppError(404, 'University not found'));
    }

    const microContent = await prisma.microContent.findMany({
      where: { universityId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({ status: 'success', data: microContent });
  } catch (err) {
    next(err);
  }
};

// GET /:id - Get specific micro-content by ID
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const microContent = await prisma.microContent.findUnique({
      where: { id },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!microContent) {
      return next(new AppError(404, 'Micro-content not found'));
    }

    res.status(200).json({ status: 'success', data: microContent });
  } catch (err) {
    next(err);
  }
};

// POST / - Create new micro-content
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityId, blockType, title, data, priority, category, content } = req.body;

    // Support both old format (category/content) and new format (blockType/data)
    const isNewFormat = blockType && data;
    const isOldFormat = category && content;

    if (!universityId || !title) {
      return next(new AppError(400, 'University ID and title are required'));
    }

    if (!isNewFormat && !isOldFormat) {
      return next(new AppError(400, 'Either (blockType and data) or (category and content) are required'));
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId }
    });

    if (!university) {
      return next(new AppError(404, 'University not found'));
    }

    // NEW: Extract user role and ID from request (assuming auth middleware provides it)
    const userRole = (req as any).user?.role || 'USER';
    const userId = (req as any).user?.id;

    // Use new format if provided, otherwise create legacy format payload
    if (isNewFormat) {
      // Use the new UniversityBlockService for routing and data integrity
      const payload = {
        blockType,
        universityId,
        title,
        data,
        priority: priority || 0,
      };
      const microContent = await UniversityBlockService.updateBlock(payload, userRole, userId);
      return res.status(201).json({ status: 'success', data: microContent });
    }

    // Legacy format support (old category/content flow)
    const microContent = await prisma.microContent.create({
      data: {
        universityId,
        blockType: 'rich_text_block',
        title,
        data: { content, format: 'html' },
        priority: priority || 0,
        category: category || null,
        content: content || null, // Backward compatibility
      }
    });

    res.status(201).json({ status: 'success', data: microContent });
  } catch (err) {
    next(err);
  }
};

// PUT /:id - Update micro-content
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { blockType, title, data, priority, category, content, universityId } = req.body;

    // Check if micro-content exists
    const existing = await prisma.microContent.findUnique({
      where: { id }
    });

    if (!existing) {
      return next(new AppError(404, 'Micro-content not found'));
    }

    // NEW: Extract user role and ID from request (assuming auth middleware provides it)
    const userRole = (req as any).user?.role || 'USER';
    const userId = (req as any).user?.id;

    // NEW: If blockType and data are provided (new format), use UniversityBlockService
    if (blockType && data) {
      const payload = {
        blockType,
        universityId: universityId || existing.universityId,
        title: title !== undefined ? title : existing.title,
        data,
        priority: priority !== undefined ? priority : existing.priority,
        id, // Include the ID for update operation
      };
      const microContent = await UniversityBlockService.updateBlock(payload, userRole, userId);
      return res.status(200).json({ status: 'success', data: microContent });
    }

    // Legacy format support (backward compatibility)
    const microContent = await prisma.microContent.update({
      where: { id },
      data: {
        blockType: blockType !== undefined ? blockType : existing.blockType,
        title: title !== undefined ? title : existing.title,
        data: data !== undefined ? data : existing.data,
        priority: priority !== undefined ? priority : existing.priority,
        category: category !== undefined ? category : existing.category,
        content: content !== undefined ? content : existing.content,
      }
    });

    res.status(200).json({ status: 'success', data: microContent });
  } catch (err) {
    next(err);
  }
};

// PATCH /reorder - Bulk update priorities
export const reorder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError(400, 'Items array is required'));
    }

    // Update priorities in a transaction
    await prisma.$transaction(
      items.map(({ id, priority }: { id: string; priority: number }) =>
        prisma.microContent.update({
          where: { id },
          data: { priority }
        })
      )
    );

    res.status(200).json({ status: 'success', message: 'Priorities updated successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /:id - Delete micro-content
export const deleteMicroContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if micro-content exists
    const existing = await prisma.microContent.findUnique({
      where: { id }
    });

    if (!existing) {
      return next(new AppError(404, 'Micro-content not found'));
    }

    await prisma.microContent.delete({
      where: { id }
    });

    res.status(200).json({ status: 'success', message: 'Micro-content deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /bulk-delete - Bulk deletion of micro-content blocks
// PROMPT 20: Multi-Block Batch Management
export const bulkDeleteMicroContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blockIds } = req.body as { blockIds: string[] };

    if (!blockIds || blockIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No blocks selected for deletion.' });
    }

    const count = await UniversityBlockService.bulkDeleteBlocks(blockIds);

    res.status(200).json({
      success: true,
      message: `${count} blocks deleted successfully.`,
      data: { count }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// POST /duplicate - Duplicates a source block to multiple target universities
// PROMPT 20: Multi-Block Batch Management
export const duplicateMicroContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourceBlockId, targetUniversityIds } = req.body as { sourceBlockId: string, targetUniversityIds: string[] };

    if (!sourceBlockId || !targetUniversityIds || targetUniversityIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Source block and target universities must be specified.' });
    }

    const createdBlocks = await UniversityBlockService.duplicateBlockToUniversities(
      sourceBlockId,
      targetUniversityIds
    );

    res.status(201).json({
      success: true,
      message: `${createdBlocks.length} copies of the block were created successfully.`,
      data: { count: createdBlocks.length }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};
