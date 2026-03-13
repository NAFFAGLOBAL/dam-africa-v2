import { z } from 'zod';

export const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().uuid().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
});

export const exportQuerySchema = z.object({
  type: z.enum(['revenue', 'payments', 'drivers', 'fleet', 'loans']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['json', 'csv']).default('json'),
});
