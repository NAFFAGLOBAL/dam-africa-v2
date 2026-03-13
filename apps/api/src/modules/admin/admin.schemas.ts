import { z } from 'zod';

export const createAdminSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'FINANCE', 'SUPPORT', 'FLEET_MANAGER']),
  phone: z.string().optional(),
  customerId: z.string().uuid().optional(),
});

export const updateAdminSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'FINANCE', 'SUPPORT', 'FLEET_MANAGER']).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const adminIdParamSchema = z.object({
  id: z.string().uuid('ID admin invalide'),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
  resource: z.string().optional(),
  adminId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updatePreferencesSchema = z.object({
  preferences: z.record(z.unknown()),
});
