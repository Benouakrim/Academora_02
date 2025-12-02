import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

// --- PUBLIC READ OPERATIONS ---

export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const search = req.query.search as string;
    const categorySlug = req.query.category as string;
    const tagSlug = req.query.tag as string;
    const authorId = req.query.authorId as string;
    
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = { some: { slug: tagSlug } };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    // Override status check if requesting user is author viewing their own drafts (handled in separate route usually, but for simplicity here)
    // Ideally, "getMyArticles" should be a separate authenticated endpoint.

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { firstName: true, lastName: true, avatarUrl: true } },
          tags: { select: { name: true, slug: true } },
          _count: { select: { comments: true } }
        }
      }),
      prisma.article.count({ where })
    ]);

    res.status(200).json({
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getArticleBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        }
      }
    });

    if (!article) {
      throw new AppError(404, 'Article not found');
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

export const getTaxonomies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { articles: true } } }
      }),
      prisma.tag.findMany({
        include: { _count: { select: { articles: true } } }
      })
    ]);
    
    res.status(200).json({ categories, tags });
  } catch (err) {
    next(err);
  }
};

// --- PROTECTED WRITE OPERATIONS ---

export const createArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const { title, slug, content, excerpt, categoryId, tags, featuredImage, status } = req.body;

    // Handle Tags: Expecting array of tag IDs. 
    // If you want to support creating tags on the fly, logic would be more complex.
    // Here we assume tags is an array of Tag IDs.
    const tagsConnect = tags?.map((tId: string) => ({ id: tId })) || [];

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        featuredImage,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        author: { connect: { id: user.id } },
        category: { connect: { id: categoryId } },
        tags: { connect: tagsConnect }
      }
    });

    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
};

export const updateArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Article not found');

    // Permission Check
    if (existing.authorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'You can only edit your own articles');
    }

    const { title, content, excerpt, categoryId, tags, featuredImage, status } = req.body;

    const updateData: any = {
      title, content, excerpt, featuredImage, status
    };

    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    }

    if (tags) {
      updateData.tags = { set: tags.map((tId: string) => ({ id: tId })) };
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData
    });

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

export const deleteArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Article not found');

    if (existing.authorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Permission denied');
    }

    await prisma.article.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};