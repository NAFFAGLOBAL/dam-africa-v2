import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class SettingsService {
  async getSettings() {
    return db.setting.findMany({ orderBy: { category: 'asc' } });
  }

  async updateSetting(key: string, data: {
    value: string;
    type?: string;
    category?: string;
    description?: string;
  }) {
    return db.setting.upsert({
      where: { key },
      create: {
        key,
        value: data.value,
        type: data.type ?? 'string',
        category: data.category,
        description: data.description,
      },
      update: {
        value: data.value,
        type: data.type,
        category: data.category,
        description: data.description,
      },
    });
  }

  async getFeatureFlags() {
    return db.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async createFeatureFlag(data: {
    key: string;
    name: string;
    description?: string;
    isEnabled?: boolean;
    conditions?: Record<string, unknown>;
  }) {
    const existing = await db.featureFlag.findUnique({ where: { key: data.key } });
    if (existing) throw new ConflictError('Un feature flag avec cette clé existe déjà');

    return db.featureFlag.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled ?? false,
        conditions: data.conditions as Prisma.InputJsonValue,
      },
    });
  }

  async updateFeatureFlag(id: string, data: {
    name?: string;
    description?: string;
    isEnabled?: boolean;
    conditions?: Record<string, unknown>;
  }) {
    const flag = await db.featureFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundError('Feature flag introuvable');

    return db.featureFlag.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled,
        conditions: data.conditions as Prisma.InputJsonValue,
      },
    });
  }

  async toggleFeatureFlag(id: string) {
    const flag = await db.featureFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundError('Feature flag introuvable');

    return db.featureFlag.update({
      where: { id },
      data: { isEnabled: !flag.isEnabled },
    });
  }
}

export const settingsService = new SettingsService();
