import { z } from 'zod';

export const awardBadgeSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  metadata: z.record(z.unknown()).optional(),
});

export const leaderboardQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  period: z.enum(['week', 'month', 'all']).default('month'),
});

export const driverIdParamSchema = z.object({
  driverId: z.string().uuid('ID conducteur invalide'),
});
