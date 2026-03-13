import { z } from 'zod';

export const createPaymentSchema = z.object({
  loanId: z.string().uuid().optional(),
  rentalId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  amount: z.number().positive('Le montant doit être positif'),
  method: z.enum(['WAVE', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CASH']).default('WAVE'),
  phone: z.string().optional(),
  description: z.string().optional(),
});

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  userId: z.string().uuid().optional(),
  loanId: z.string().uuid().optional(),
  method: z.enum(['WAVE', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CASH']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const paymentIdParamSchema = z.object({
  id: z.string().uuid('ID paiement invalide'),
});
