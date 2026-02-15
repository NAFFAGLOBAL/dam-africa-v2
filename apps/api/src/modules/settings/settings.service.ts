import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { UpsertSettingInput } from './settings.schemas';

export class SettingsService {
  async getAllSettings() {
    const settings = await db.setting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {});

    return settingsMap;
  }

  async getSetting(key: string) {
    const setting = await db.setting.findUnique({
      where: { key },
    });

    if (!setting) throw new NotFoundError('Setting');
    return setting;
  }

  async upsertSetting(key: string, data: UpsertSettingInput) {
    const setting = await db.setting.upsert({
      where: { key },
      update: {
        value: data.value,
        description: data.description,
      },
      create: {
        key,
        value: data.value,
        description: data.description,
      },
    });

    logger.info('Setting updated:', { key });
    return setting;
  }

  async deleteSetting(key: string) {
    const setting = await db.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundError('Setting');

    await db.setting.delete({ where: { key } });
    logger.info('Setting deleted:', { key });
    return { deleted: true };
  }

  getDefaultSettings() {
    return {
      'loan.interest_rate.default': {
        value: 15,
        description: 'Taux d\'intérêt par défaut pour les prêts (en pourcentage)',
      },
      'loan.interest_rate.min': {
        value: 10,
        description: 'Taux d\'intérêt minimum (en pourcentage)',
      },
      'loan.interest_rate.max': {
        value: 25,
        description: 'Taux d\'intérêt maximum (en pourcentage)',
      },
      'loan.amount.min': {
        value: 50000,
        description: 'Montant minimum de prêt (en XOF)',
      },
      'loan.amount.max': {
        value: 5000000,
        description: 'Montant maximum de prêt (en XOF)',
      },
      'loan.term_weeks.min': {
        value: 4,
        description: 'Durée minimum de prêt (en semaines)',
      },
      'loan.term_weeks.max': {
        value: 52,
        description: 'Durée maximum de prêt (en semaines)',
      },
      'credit.score.min_for_loan': {
        value: 300,
        description: 'Score de crédit minimum requis pour obtenir un prêt',
      },
      'credit.score.weight.payment_history': {
        value: 0.35,
        description: 'Poids de l\'historique de paiement dans le calcul du score de crédit',
      },
      'credit.score.weight.loan_utilization': {
        value: 0.25,
        description: 'Poids de l\'utilisation du crédit dans le calcul du score de crédit',
      },
      'credit.score.weight.account_age': {
        value: 0.15,
        description: 'Poids de l\'ancienneté du compte dans le calcul du score de crédit',
      },
      'credit.score.weight.driving_performance': {
        value: 0.15,
        description: 'Poids des performances de conduite dans le calcul du score de crédit',
      },
      'credit.score.weight.kyc_completeness': {
        value: 0.10,
        description: 'Poids de la complétude du KYC dans le calcul du score de crédit',
      },
      'kyc.required_documents': {
        value: ['ID_CARD', 'DRIVERS_LICENSE', 'SELFIE'],
        description: 'Documents KYC requis pour la vérification',
      },
      'payment.late_fee.enabled': {
        value: true,
        description: 'Activer les frais de retard de paiement',
      },
      'payment.late_fee.amount': {
        value: 5000,
        description: 'Montant des frais de retard (en XOF)',
      },
      'payment.late_fee.grace_period_days': {
        value: 3,
        description: 'Période de grâce avant application des frais de retard (en jours)',
      },
      'notification.payment_reminder.days_before': {
        value: 3,
        description: 'Nombre de jours avant l\'échéance pour envoyer un rappel de paiement',
      },
      'vehicle.rental.weekly_rate.default': {
        value: 50000,
        description: 'Tarif de location hebdomadaire par défaut (en XOF)',
      },
    };
  }

  async initializeDefaultSettings() {
    const defaults = this.getDefaultSettings();
    const existing = await db.setting.findMany();
    const existingKeys = new Set(existing.map((s: any) => s.key));

    const settingsToCreate = Object.entries(defaults)
      .filter(([key]) => !existingKeys.has(key))
      .map(([key, data]) => ({
        key,
        value: data.value,
        description: data.description,
      }));

    if (settingsToCreate.length > 0) {
      await db.setting.createMany({
        data: settingsToCreate,
        skipDuplicates: true,
      });
      logger.info('Default settings initialized:', { count: settingsToCreate.length });
    }

    return { initialized: settingsToCreate.length };
  }
}

export const settingsService = new SettingsService();
