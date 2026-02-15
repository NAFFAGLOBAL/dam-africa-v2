import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    type: z.enum([
      'PAYMENT_REMINDER',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'LOAN_APPROVED',
      'LOAN_REJECTED',
      'KYC_APPROVED',
      'KYC_REJECTED',
      'CREDIT_SCORE_UPDATED',
      'SYSTEM',
    ]),
    title: z.string().min(1).max(255),
    message: z.string().min(1),
    metadata: z.record(z.any()).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
  }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>['body'];
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>['params'];
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>['query'];
