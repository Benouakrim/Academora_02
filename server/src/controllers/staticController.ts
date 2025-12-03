// server/src/controllers/staticController.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const getPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Placeholder: Fetch all published static pages
    const pages = await prisma.staticPage.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { title: 'asc' }
    });

    res.status(200).json({ status: 'success', data: pages });
  } catch (err) {
    next(err);
  }
};

export const getPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const page = await prisma.staticPage.findUnique({
      where: { slug, published: true }
    });

    if (!page) {
      return next(new AppError(404, 'Page not found'));
    }

    res.status(200).json({ status: 'success', data: page });
  } catch (err) {
    next(err);
  }
};
