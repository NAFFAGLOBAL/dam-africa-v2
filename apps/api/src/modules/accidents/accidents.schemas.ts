import { z } from 'zod';

export const reportAccidentSchema = z.object({
  vehicleId: z.string().uuid(),
  severity: z.enum(['MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS']),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().min(10, 'Description trop courte'),
  occurredAt: z.string(),
  damageCost: z.number().optional(),
});

export const listAccidentReportsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  severity: z.enum(['MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS']).optional(),
  userId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

export const reportIdParamSchema = z.object({
  id: z.string().uuid('ID rapport invalide'),
});

export const addMediaSchema = z.object({
  fileUrl: z.string().url(),
  fileType: z.string(),
  caption: z.string().optional(),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, 'Contenu requis'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['INVESTIGATING', 'RESOLVED', 'CLOSED']),
  damageCost: z.number().optional(),
  insuranceClaim: z.string().optional(),
});
