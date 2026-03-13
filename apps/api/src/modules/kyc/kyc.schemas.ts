import { z } from 'zod';

export const submitDocumentSchema = z.object({
  type: z.enum(['NATIONAL_ID', 'DRIVERS_LICENSE', 'PASSPORT', 'PROOF_OF_ADDRESS', 'SELFIE', 'OTHER']),
  fileUrl: z.string().url('URL du fichier invalide'),
  fileName: z.string().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const reviewDocumentSchema = z.object({
  reviewNote: z.string().optional(),
});

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  userId: z.string().uuid().optional(),
  type: z.enum(['NATIONAL_ID', 'DRIVERS_LICENSE', 'PASSPORT', 'PROOF_OF_ADDRESS', 'SELFIE', 'OTHER']).optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().uuid('ID document invalide'),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
});
