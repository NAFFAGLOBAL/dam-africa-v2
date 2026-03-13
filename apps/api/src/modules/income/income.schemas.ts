import { z } from 'zod';

export const recordIncomeSchema = z.object({
  source: z.enum(['YANGO', 'UBER', 'BOLT', 'PRIVATE', 'OTHER']),
  amount: z.number().positive('Le montant doit être positif'),
  date: z.string(),
  trips: z.number().int().optional(),
  hours: z.number().optional(),
  reference: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listIncomeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  source: z.enum(['YANGO', 'UBER', 'BOLT', 'PRIVATE', 'OTHER']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
  isVerified: z.coerce.boolean().optional(),
});

export const incomeIdParamSchema = z.object({
  id: z.string().uuid('ID revenu invalide'),
});

export const bulkImportSchema = z.object({
  records: z.array(z.object({
    userId: z.string().uuid(),
    source: z.enum(['YANGO', 'UBER', 'BOLT', 'PRIVATE', 'OTHER']),
    amount: z.number().positive(),
    date: z.string(),
    trips: z.number().int().optional(),
    hours: z.number().optional(),
    reference: z.string().optional(),
  })),
});
