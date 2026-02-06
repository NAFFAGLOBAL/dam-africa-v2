import { z } from 'zod';

/**
 * Submit KYC document schema
 */
export const submitKYCDocumentSchema = z.object({
  body: z.object({
    documentType: z.enum([
      'ID_CARD',
      'PASSPORT',
      'DRIVERS_LICENSE',
      'SELFIE',
      'VEHICLE_REGISTRATION',
      'PROOF_OF_ADDRESS',
    ]),
    documentNumber: z.string().optional(),
    expiryDate: z.string().datetime().optional(),
    frontImageUrl: z.string().url(),
    backImageUrl: z.string().url().optional(),
  }),
});

/**
 * Review KYC document schema (Admin)
 */
export const reviewKYCDocumentSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().min(10).max(500).optional(),
  }).refine(
    (data) => {
      if (data.status === 'REJECTED' && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting',
      path: ['rejectionReason'],
    }
  ),
});

/**
 * List KYC documents query schema
 */
export const listKYCDocumentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    userId: z.string().uuid().optional(),
    documentType: z.enum([
      'ID_CARD',
      'PASSPORT',
      'DRIVERS_LICENSE',
      'SELFIE',
      'VEHICLE_REGISTRATION',
      'PROOF_OF_ADDRESS',
    ]).optional(),
  }),
});

export const documentIdParamSchema = z.object({
  params: z.object({
    documentId: z.string().uuid('Invalid document ID'),
  }),
});

export type SubmitKYCDocumentInput = z.infer<typeof submitKYCDocumentSchema>['body'];
export type ReviewKYCDocumentInput = z.infer<typeof reviewKYCDocumentSchema>['body'];
export type ListKYCDocumentsQuery = z.infer<typeof listKYCDocumentsQuerySchema>['query'];
export type DocumentIdParam = z.infer<typeof documentIdParamSchema>['params'];
