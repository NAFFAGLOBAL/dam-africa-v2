import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  code: z.string().min(1, 'Code requis'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const customerIdParamSchema = z.object({
  id: z.string().uuid('ID client invalide'),
});
