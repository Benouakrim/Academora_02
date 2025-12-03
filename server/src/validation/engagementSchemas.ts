import { z } from 'zod';

export const toggleReviewHelpfulSchema = {
  params: z.object({
    id: z.string().uuid('Invalid review ID format'),
  }),
};
