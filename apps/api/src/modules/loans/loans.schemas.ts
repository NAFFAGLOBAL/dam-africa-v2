import { z } from 'zod';

export const applyForLoanSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  termMonths: z.number().int().min(1).max(60, 'Durée maximale de 60 mois'),
  purpose: z.string().optional(),
});

export const listLoansQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED']).optional(),
  userId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

export const loanIdParamSchema = z.object({
  id: z.string().uuid('ID prêt invalide'),
});

export const rejectLoanSchema = z.object({
  reason: z.string().min(1, 'Raison du rejet requise'),
});
