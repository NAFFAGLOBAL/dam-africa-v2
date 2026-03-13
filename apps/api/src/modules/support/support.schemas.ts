import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Sujet requis'),
  description: z.string().min(10, 'Description trop courte'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.string().optional(),
});

export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  userId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
});

export const ticketIdParamSchema = z.object({
  id: z.string().uuid('ID ticket invalide'),
});

export const addMessageSchema = z.object({
  content: z.string().min(1, 'Message requis'),
});

export const assignTicketSchema = z.object({
  assigneeId: z.string().uuid('ID assigné invalide'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']),
});
