import { z } from 'zod';

export const createVehicleSchema = z.object({
  registrationNo: z.string().min(1, 'Numéro d\'immatriculation requis'),
  make: z.string().min(1, 'Marque requise'),
  model: z.string().min(1, 'Modèle requis'),
  year: z.number().int().min(2000).max(2030),
  color: z.string().optional(),
  vin: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  seatingCapacity: z.number().int().optional(),
  dailyRate: z.number().positive().optional(),
  weeklyRate: z.number().positive().optional(),
  monthlyRate: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  currentValue: z.number().positive().optional(),
  insuranceExpiry: z.string().optional(),
  imageUrl: z.string().optional(),
  gpsDeviceId: z.string().optional(),
  customerId: z.string().uuid().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const listVehiclesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'RETIRED', 'RESERVED']).optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const vehicleIdParamSchema = z.object({
  id: z.string().uuid('ID véhicule invalide'),
});

export const addMaintenanceSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().min(0),
  mileageAt: z.number().optional(),
  performedBy: z.string().optional(),
  performedAt: z.string(),
  nextDueAt: z.string().optional(),
  nextDueMileage: z.number().optional(),
  notes: z.string().optional(),
});
