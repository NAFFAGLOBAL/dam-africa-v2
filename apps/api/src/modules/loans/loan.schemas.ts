import { z } from 'zod';

/**
 * Apply for loan schema
 */
export const applyForLoanSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .min(100000, 'Minimum loan amount is 100,000 XOF')
      .max(2000000, 'Maximum loan amount is 2,000,000 XOF'),
    termWeeks: z
      .number()
      .int()
      .min(4, 'Minimum term is 4 weeks')
      .max(52, 'Maximum term is 52 weeks'),
    purpose: z
      .string()
      .min(10, 'Purpose must be at least 10 characters')
      .max(200, 'Purpose must not exceed 200 characters'),
  }),
});

/**
 * Approve loan schema (Admin)
 */
export const approveLoanSchema = z.object({
  body: z.object({
    approvedAmount: z.number().min(100000).optional(),
    termWeeks: z.number().int().min(4).max(52).optional(),
    interestRate: z.number().min(0).max(50).optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Reject loan schema (Admin)
 */
export const rejectLoanSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(10, 'Rejection reason must be at least 10 characters')
      .max(500, 'Rejection reason must not exceed 500 characters'),
  }),
});

/**
 * List loans query schema
 */
export const listLoansQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z
      .enum(['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DEFAULTED'])
      .optional(),
    userId: z.string().uuid().optional(),
  }),
});

/**
 * Loan ID param schema
 */
export const loanIdParamSchema = z.object({
  params: z.object({
    loanId: z.string().uuid('Invalid loan ID'),
  }),
});

export type ApplyForLoanInput = z.infer<typeof applyForLoanSchema>['body'];
export type ApproveLoanInput = z.infer<typeof approveLoanSchema>['body'];
export type RejectLoanInput = z.infer<typeof rejectLoanSchema>['body'];
export type ListLoansQuery = z.infer<typeof listLoansQuerySchema>['query'];
export type LoanIdParam = z.infer<typeof loanIdParamSchema>['params'];
