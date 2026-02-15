import { z } from 'zod';

export const upsertSettingSchema = z.object({
  params: z.object({
    key: z.string().min(1).max(100),
  }),
  body: z.object({
    value: z.any(),
    description: z.string().optional(),
  }),
});

export const settingKeyParamSchema = z.object({
  params: z.object({
    key: z.string().min(1).max(100),
  }),
});

export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>['body'];
export type SettingKeyParam = z.infer<typeof settingKeyParamSchema>['params'];
