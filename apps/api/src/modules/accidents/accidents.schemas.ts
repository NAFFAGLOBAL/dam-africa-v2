import { z } from 'zod';

export const reportAccidentSchema = z.object({
  vehicleId: z.string().uuid('ID véhicule invalide'),
  description: z.string().min(1, 'Description requise'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string().optional(),
  thirdPartyInvolved: z.boolean().optional(),
  occurredAt: z.string().optional(),
});

export const addMediaSchema = z.object({
  fileUrl: z.string().url('URL de fichier invalide'),
  fileType: z.enum(['PHOTO', 'VIDEO', 'DOCUMENT'], {
    errorMap: () => ({ message: 'Type de fichier invalide' }),
  }),
  caption: z.string().optional(),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, 'Contenu requis'),
});

export const updateSeveritySchema = z.object({
  severity: z.enum(['MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS'], {
    errorMap: () => ({ message: 'Niveau de gravité invalide' }),
  }),
});

export const attachPoliceReportSchema = z.object({
  policeReportUrl: z.string().url('URL du rapport de police invalide'),
  policeReportNumber: z.string().optional(),
});

export const determineResponsibilitySchema = z.object({
  driverFault: z.enum(['DRIVER_AT_FAULT', 'DRIVER_NOT_AT_FAULT'], {
    errorMap: () => ({ message: 'Valeur de responsabilité invalide' }),
  }),
  creditScoreImpact: z.number().int().min(0).max(200).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['INVESTIGATING', 'RESOLVED', 'CLOSED'], {
    errorMap: () => ({ message: 'Statut invalide' }),
  }),
});

export const listAccidentReportsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  severity: z.enum(['MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS']).optional(),
  driverFault: z.enum(['NOT_DETERMINED', 'DRIVER_AT_FAULT', 'DRIVER_NOT_AT_FAULT']).optional(),
  userId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

export const reportIdParamSchema = z.object({
  id: z.string().uuid('ID rapport invalide'),
});

export const riskZonesQuerySchema = z.object({
  radiusKm: z.coerce.number().min(0.1).max(50).default(1),
  minIncidents: z.coerce.number().min(1).default(3),
});
