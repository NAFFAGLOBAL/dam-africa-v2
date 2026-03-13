import { z } from 'zod';

export const requestRentalSchema = z.object({
  vehicleId: z.string().uuid('ID véhicule invalide'),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
});

export const listRentalsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['REQUESTED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'CANCELLED']).optional(),
  userId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

export const rentalIdParamSchema = z.object({
  id: z.string().uuid('ID location invalide'),
});

export const terminateRentalSchema = z.object({
  reason: z.string().min(1, 'Raison de résiliation requise'),
});
