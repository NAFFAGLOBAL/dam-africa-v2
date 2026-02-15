import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    make: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    licensePlate: z.string().min(1).max(20),
    color: z.string().max(50).optional(),
    vin: z.string().max(50).optional(),
    photoUrl: z.string().url().optional(),
    purchasePrice: z.number().min(0).optional(),
    currentValue: z.number().min(0).optional(),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    make: z.string().min(1).max(100).optional(),
    model: z.string().min(1).max(100).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    licensePlate: z.string().min(1).max(20).optional(),
    color: z.string().max(50).optional(),
    vin: z.string().max(50).optional(),
    status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'RETIRED']).optional(),
    photoUrl: z.string().url().optional(),
    purchasePrice: z.number().min(0).optional(),
    currentValue: z.number().min(0).optional(),
  }),
});

export const assignVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string().uuid(),
    weeklyRate: z.number().min(1000),
    startDate: z.string().datetime(),
  }),
});

export const returnVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    returnNotes: z.string().optional(),
  }),
});

export const vehicleIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listVehiclesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'RETIRED']).optional(),
  }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
export type AssignVehicleInput = z.infer<typeof assignVehicleSchema>['body'];
export type ReturnVehicleInput = z.infer<typeof returnVehicleSchema>['body'];
export type VehicleIdParam = z.infer<typeof vehicleIdParamSchema>['params'];
export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>['query'];
