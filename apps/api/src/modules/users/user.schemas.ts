import { z } from 'zod';

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    dateOfBirth: z.string().datetime().optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    profilePhotoUrl: z.string().url().optional(),
  }),
});

/**
 * List users query schema (Admin)
 */
export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    search: z.string().optional(),
    kycStatus: z.enum(['NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
    creditRating: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  }),
});

/**
 * User ID param schema
 */
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

/**
 * Suspend user schema (Admin)
 */
export const suspendUserSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>['query'];
export type UserIdParam = z.infer<typeof userIdParamSchema>['params'];
export type SuspendUserInput = z.infer<typeof suspendUserSchema>['body'];
