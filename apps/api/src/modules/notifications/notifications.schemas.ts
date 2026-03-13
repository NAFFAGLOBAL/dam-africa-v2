import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  isRead: z.coerce.boolean().optional(),
  type: z.enum([
    'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'LOAN_STATUS', 'KYC_STATUS',
    'RENTAL_STATUS', 'SYSTEM', 'BADGE_EARNED', 'MAINTENANCE', 'ALERT',
  ]).optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid('ID notification invalide'),
});
