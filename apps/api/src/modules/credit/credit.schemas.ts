import { z } from 'zod';

export const userIdParamSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
});

export const scoreHistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
