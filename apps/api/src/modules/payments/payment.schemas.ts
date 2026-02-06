import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  body: z.object({
    loanId: z.string().uuid(),
    amount: z.number().min(1000).max(10000000),
    method: z.enum(['WAVE', 'ORANGE_MONEY', 'MTN_MOMO', 'BANK_TRANSFER', 'CARD', 'CASH']),
    reference: z.string().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    providerReference: z.string(),
  }),
});

export const manualPaymentSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    loanId: z.string().uuid(),
    amount: z.number().min(1000),
    method: z.enum(['WAVE', 'ORANGE_MONEY', 'MTN_MOMO', 'BANK_TRANSFER', 'CARD', 'CASH']),
    reference: z.string(),
    notes: z.string().optional(),
  }),
});

export const listPaymentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']).optional(),
    userId: z.string().uuid().optional(),
    loanId: z.string().uuid().optional(),
    method: z.enum(['WAVE', 'ORANGE_MONEY', 'MTN_MOMO', 'BANK_TRANSFER', 'CARD', 'CASH']).optional(),
  }),
});

export const paymentIdParamSchema = z.object({
  params: z.object({
    paymentId: z.string().uuid(),
  }),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>['body'];
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>['body'];
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>['body'];
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>['query'];
export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>['params'];
