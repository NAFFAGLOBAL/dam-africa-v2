import { z } from 'zod';

export const vehicleIdParamSchema = z.object({
  vehicleId: z.string().uuid('ID véhicule invalide'),
});

export const createGeofenceSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  type: z.enum(['CITY_BOUNDARY', 'RESTRICTED_ZONE', 'PARKING', 'MAINTENANCE_CENTER', 'CUSTOM']).default('CUSTOM'),
  coordinates: z.any(),
  radius: z.number().optional(),
  description: z.string().optional(),
});

export const updateGeofenceSchema = createGeofenceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const geofenceIdParamSchema = z.object({
  id: z.string().uuid('ID zone invalide'),
});

export const listGeofenceAlertsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  vehicleId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  acknowledged: z.coerce.boolean().optional(),
});

export const syncTelemetrySchema = z.object({
  vehicleId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  altitude: z.number().optional(),
  ignition: z.boolean().optional(),
  fuelLevel: z.number().optional(),
  mileage: z.number().optional(),
  timestamp: z.string(),
});
