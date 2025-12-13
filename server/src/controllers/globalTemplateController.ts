// server/src/controllers/globalTemplateController.ts
// Controller for managing Global Block Templates (CRUD operations)
// Access restricted to Super Admins only via requireAdmin middleware

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

// Request body type for creating/updating a template
interface TemplatePayload {
  name: string;
  blockType: string;
  description?: string;
  data: Record<string, any>;
  isSystem?: boolean;
}

/**
 * Creates a new Global Block Template
 * Restricted to Super Admins
 * 
 * @param req - Express Request with TemplatePayload in body
 * @param res - Express Response
 * @throws AppError (400) if name or blockType missing
 */
export const createTemplate = async (req: Request, res: Response) => {
  const { name, blockType, description, data, isSystem } = req.body as TemplatePayload;
  
  if (!name || !blockType) {
    throw new AppError(400, 'Name and Block Type are required for creating a template.');
  }

  const template = await (prisma as any).globalBlockTemplate.create({
    data: {
      name,
      blockType,
      description: description || null,
      data,
      isSystem: isSystem ?? false,
    },
  });

  res.status(201).json({ success: true, data: template });
};

/**
 * Retrieves all Global Block Templates
 * Restricted to Super Admins
 * Ordered alphabetically by name
 * 
 * @param req - Express Request
 * @param res - Express Response
 */
export const getAllTemplates = async (req: Request, res: Response) => {
  const templates = await (prisma as any).globalBlockTemplate.findMany({
    orderBy: { name: 'asc' },
  });
  res.status(200).json({ success: true, data: templates });
};

/**
 * Retrieves a specific Global Block Template by ID
 * Restricted to Super Admins
 * 
 * @param req - Express Request with id in params
 * @param res - Express Response
 * @throws AppError (404) if template not found
 */
export const getTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const template = await (prisma as any).globalBlockTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    throw new AppError(404, 'Template not found.');
  }

  res.status(200).json({ success: true, data: template });
};

/**
 * Updates an existing Global Block Template
 * Restricted to Super Admins
 * Cannot modify system-locked templates (isSystem = true)
 * 
 * @param req - Express Request with id in params and TemplatePayload in body
 * @param res - Express Response
 * @throws AppError (403) if attempting to modify system-locked template
 */
export const updateTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, blockType, description, data, isSystem } = req.body as TemplatePayload;

  // Check if template is system-locked
  const existingTemplate = await (prisma as any).globalBlockTemplate.findUnique({
    where: { id },
  });

  if (existingTemplate?.isSystem) {
    throw new AppError(403, 'Cannot modify system-locked block templates.');
  }

  const template = await (prisma as any).globalBlockTemplate.update({
    where: { id },
    data: {
      name,
      blockType,
      description: description || null,
      data,
      isSystem,
    },
  });

  res.status(200).json({ success: true, data: template });
};

/**
 * Deletes a Global Block Template
 * Restricted to Super Admins
 * Cannot delete system-locked templates (isSystem = true)
 * 
 * @param req - Express Request with id in params
 * @param res - Express Response
 * @throws AppError (403) if attempting to delete system-locked template
 * @throws AppError (404) if template not found
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if template is system-locked
  const template = await (prisma as any).globalBlockTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    throw new AppError(404, 'Template not found.');
  }

  if (template.isSystem) {
    throw new AppError(403, 'Cannot delete system-locked block templates.');
  }

  await (prisma as any).globalBlockTemplate.delete({
    where: { id },
  });

  res.status(204).send();
};
