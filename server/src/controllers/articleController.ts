import { Request, Response, NextFunction } from 'express';
import { Prisma, UserRole, ArticleStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

const MAX_PENDING_ARTICLES = 3;

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

    // Accept either slug or id to support admin edit routes
    const article = await prisma.article.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
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

    const { title, slug, content, excerpt, categoryId, tags, featuredImage, status, metaTitle, metaDescription, focusKeyword, ogImage, canonicalUrl } = req.body;

    // Decide final status based on role
    let finalStatus: ArticleStatus = status || 'DRAFT';
    if (user.role !== UserRole.ADMIN) {
      // Non-admins cannot publish directly
      if (status === 'PUBLISHED' || status === 'ARCHIVED') {
        finalStatus = 'PENDING';
      }

      // Enforce max pending articles limit when submitting for review
      if (finalStatus === 'PENDING') {
        const pendingCount = await prisma.article.count({
          where: { authorId: user.id, status: 'PENDING' }
        });
        if (pendingCount >= MAX_PENDING_ARTICLES) {
          throw new AppError(400, `You have reached the maximum of ${MAX_PENDING_ARTICLES} pending articles.`);
        }
      }
    }

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
        status: finalStatus,
        publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        focusKeyword,
        ogImage,
        canonicalUrl,
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

    const { title, content, excerpt, categoryId, tags, featuredImage, status, metaTitle, metaDescription, focusKeyword, ogImage, canonicalUrl, rejectionReason } = req.body;

    // Determine final status with role-based rules
    let finalStatus: ArticleStatus = status || existing.status;

    if (user.role !== UserRole.ADMIN) {
      // Non-admins cannot publish/archived directly
      if (finalStatus === 'PUBLISHED' || finalStatus === 'ARCHIVED') {
        finalStatus = 'PENDING';
      }

      // Pending limit (exclude this article if already pending)
      if (finalStatus === 'PENDING' && existing.status !== 'PENDING') {
        const pendingCount = await prisma.article.count({
          where: { authorId: user.id, status: 'PENDING', NOT: { id } }
        });
        if (pendingCount >= MAX_PENDING_ARTICLES) {
          throw new AppError(400, `You have reached the maximum of ${MAX_PENDING_ARTICLES} pending articles.`);
        }
      }
    }

    const updateData: any = {
      title, content, excerpt, featuredImage,
      status: finalStatus,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      focusKeyword,
      ogImage,
      canonicalUrl
    };

    if (finalStatus === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    if (user.role === UserRole.ADMIN && finalStatus === 'REJECTED') {
      updateData.rejectionReason = rejectionReason || existing.rejectionReason || 'No reason provided';
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = { connect: { id: user.id } };
    }

    // If user resubmits, clear old rejection metadata
    if (finalStatus === 'PENDING') {
      updateData.rejectionReason = null;
      updateData.reviewedAt = null;
      updateData.reviewedBy = { disconnect: true };
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

export const recordView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!article) {
      throw new AppError(404, 'Article not found');
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const likeArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new AppError(404, 'Article not found');

    // Check if already liked
    const existingLike = await prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId: id,
          userId: user.id
        }
      }
    });

    if (existingLike) {
      throw new AppError(400, 'Article already liked');
    }

    // Create like and increment count
    await prisma.$transaction([
      prisma.articleLike.create({
        data: {
          articleId: id,
          userId: user.id
        }
      }),
      prisma.article.update({
        where: { id },
        data: { likeCount: { increment: 1 } }
      })
    ]);

    res.status(200).json({ success: true, liked: true });
  } catch (err) {
    next(err);
  }
};

export const unlikeArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new AppError(404, 'Article not found');

    // Check if liked
    const existingLike = await prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId: id,
          userId: user.id
        }
      }
    });

    if (!existingLike) {
      throw new AppError(400, 'Article not liked');
    }

    // Delete like and decrement count
    await prisma.$transaction([
      prisma.articleLike.delete({
        where: {
          articleId_userId: {
            articleId: id,
            userId: user.id
          }
        }
      }),
      prisma.article.update({
        where: { id },
        data: { likeCount: { decrement: 1 } }
      })
    ]);

    res.status(200).json({ success: true, liked: false });
  } catch (err) {
    next(err);
  }
};

export const getLikeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const existingLike = await prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId: id,
          userId: user.id
        }
      }
    });

    res.status(200).json({ isLiked: !!existingLike });
  } catch (err) {
    next(err);
  }
};

export const shareArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!article) {
      throw new AppError(404, 'Article not found');
    }

    await prisma.article.update({
      where: { id },
      data: { shareCount: { increment: 1 } }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// --- USER WORKFLOW: OWN ARTICLES ---
export const getMyArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const articles = await prisma.article.findMany({
      where: { authorId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } }
      }
    });

    res.status(200).json({ data: articles });
  } catch (err) {
    next(err);
  }
};

export const submitArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new AppError(404, 'Article not found');
    if (article.authorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new AppError(403, 'You can only submit your own articles');
    }

    // Enforce pending limit (exclude this article if already pending)
    if (article.status !== 'PENDING') {
      const pendingCount = await prisma.article.count({
        where: { authorId: article.authorId, status: 'PENDING', NOT: { id } }
      });
      if (pendingCount >= MAX_PENDING_ARTICLES) {
        throw new AppError(400, `You have reached the maximum of ${MAX_PENDING_ARTICLES} pending articles.`);
      }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: 'PENDING',
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: { disconnect: true },
        // keep publishedAt null until approved
      }
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// --- ADMIN WORKFLOW: REVIEW ---
export const getPendingArticles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pending = await prisma.article.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { name: true } }
      }
    });

    res.status(200).json({ data: pending });
  } catch (err) {
    next(err);
  }
};

export const approveArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const reviewer = await prisma.user.findUnique({ where: { clerkId } });
    if (!reviewer) throw new AppError(404, 'User not found');
    if (reviewer.role !== UserRole.ADMIN) throw new AppError(403, 'Admin only');

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new AppError(404, 'Article not found');

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: article.publishedAt || new Date(),
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedBy: { connect: { id: reviewer.id } }
      }
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const rejectArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const reviewer = await prisma.user.findUnique({ where: { clerkId } });
    if (!reviewer) throw new AppError(404, 'User not found');
    if (reviewer.role !== UserRole.ADMIN) throw new AppError(403, 'Admin only');

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new AppError(404, 'Article not found');

    const rejectionReason = reason || req.body.rejectionReason || 'No reason provided';

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
        reviewedAt: new Date(),
        reviewedBy: { connect: { id: reviewer.id } }
      }
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};