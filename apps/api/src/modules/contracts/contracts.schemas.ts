import { z } from 'zod';

export const createContractSchema = z.object({
  userId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  type: z.enum(['RENT_TO_OWN', 'LEASE', 'STANDARD_RENTAL']).default('RENT_TO_OWN'),
  totalValue: z.number().positive(),
  monthlyPayment: z.number().positive(),
  downPayment: z.number().min(0).default(0),
  totalInstallments: z.number().int().positive(),
  ownershipThreshold: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

export const listContractsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'DEFAULTED']).optional(),
  userId: z.string().uuid().optional(),
  type: z.enum(['RENT_TO_OWN', 'LEASE', 'STANDARD_RENTAL']).optional(),
});

export const contractIdParamSchema = z.object({
  id: z.string().uuid('ID contrat invalide'),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['WAVE', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CASH']).default('WAVE'),
  phone: z.string().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export const terminateContractSchema = z.object({
  reason: z.string().min(1, 'Raison de résiliation requise'),
});
