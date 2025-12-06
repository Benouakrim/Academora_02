import { z } from 'zod'

export const analyzeSchema = z.object({
  content: z.any().optional().default({}),
  title: z.string().min(1, 'Title is required'),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().optional(),
  articleId: z.string().optional(),
})

export type AnalyzeRequest = z.infer<typeof analyzeSchema>

export const historyParamsSchema = z.object({ articleId: z.string().min(1) })

