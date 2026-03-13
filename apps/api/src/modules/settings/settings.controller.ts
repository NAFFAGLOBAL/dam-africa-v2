import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../../utils/response';
import { settingsService } from './settings.service';

export class SettingsController {
  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    sendSuccess(res, settings);
  });

  updateSetting = asyncHandler(async (req: Request, res: Response) => {
    const setting = await settingsService.updateSetting(req.params.key, req.body);
    sendSuccess(res, setting, 'Paramètre mis à jour');
  });

  getFeatureFlags = asyncHandler(async (_req: Request, res: Response) => {
    const flags = await settingsService.getFeatureFlags();
    sendSuccess(res, flags);
  });

  createFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
    const flag = await settingsService.createFeatureFlag(req.body);
    sendCreated(res, flag, 'Feature flag créé');
  });

  updateFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
    const flag = await settingsService.updateFeatureFlag(req.params.id, req.body);
    sendSuccess(res, flag, 'Feature flag mis à jour');
  });

  toggleFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
    const flag = await settingsService.toggleFeatureFlag(req.params.id);
    sendSuccess(res, flag, `Feature flag ${flag.isEnabled ? 'activé' : 'désactivé'}`);
  });
}

export const settingsController = new SettingsController();
