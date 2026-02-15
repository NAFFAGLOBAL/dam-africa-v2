import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type { UpsertSettingInput } from './settings.schemas';

export class SettingsController {
  getAllSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getAllSettings();
    sendSuccess(res, settings);
  });

  getSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await settingsService.getSetting(key);
    sendSuccess(res, setting);
  });

  upsertSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const data = req.body as UpsertSettingInput;
    const setting = await settingsService.upsertSetting(key, data);
    sendSuccess(res, setting, 'Paramètre mis à jour avec succès');
  });

  deleteSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const result = await settingsService.deleteSetting(key);
    sendSuccess(res, result, 'Paramètre supprimé avec succès');
  });

  getDefaultSettings = asyncHandler(async (req: Request, res: Response) => {
    const defaults = settingsService.getDefaultSettings();
    sendSuccess(res, defaults);
  });

  initializeDefaultSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.initializeDefaultSettings();
    sendSuccess(res, result, 'Paramètres par défaut initialisés avec succès');
  });
}

export const settingsController = new SettingsController();
