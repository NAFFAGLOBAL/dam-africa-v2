import { z } from 'zod';

export const updateSettingSchema = z.object({
  value: z.string(),
  type: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const settingKeyParamSchema = z.object({
  key: z.string().min(1, 'Clé requise'),
});

export const createFeatureFlagSchema = z.object({
  key: z.string().min(1, 'Clé requise'),
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  conditions: z.record(z.unknown()).optional(),
});

export const updateFeatureFlagSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isEnabled: z.boolean().optional(),
  conditions: z.record(z.unknown()).optional(),
});

export const featureFlagIdParamSchema = z.object({
  id: z.string().uuid('ID feature flag invalide'),
});
