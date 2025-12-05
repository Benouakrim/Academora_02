import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';

export const createArticleSchema = {
  body: z.object({
    title: z.string().min(5).max(150),
    slug: z.string().min(5).regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
    content: z.string().min(20), // HTML content from Tiptap
    excerpt: z.string().max(300).optional(),
    featuredImage: z.string().url().optional().or(z.literal('')),
    categoryId: z.string().uuid(),
    tags: z.array(z.string()).optional(), // Array of tag IDs or Names (we'll handle logic)
    status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
    // SEO Fields
    metaTitle: z.string().max(60).optional().or(z.literal('')),
    metaDescription: z.string().max(160).optional().or(z.literal('')),
    focusKeyword: z.string().max(100).optional().or(z.literal('')),
    ogImage: z.string().url().optional().or(z.literal('')),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
  }),
};

export const updateArticleSchema = {
  body: createArticleSchema.body.partial(),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const commentSchema = {
  body: z.object({
    content: z.string().min(2).max(1000),
    articleId: z.string().uuid(),
    parentId: z.string().uuid().optional(),
  }),
};
