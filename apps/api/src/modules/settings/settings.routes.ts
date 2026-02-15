import { Router } from 'express';
import { settingsController } from './settings.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { upsertSettingSchema, settingKeyParamSchema } from './settings.schemas';

const router = Router();

// All settings routes require SUPER_ADMIN authentication
router.get(
  '/',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  settingsController.getAllSettings
);

router.get(
  '/defaults',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  settingsController.getDefaultSettings
);

router.post(
  '/initialize',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  settingsController.initializeDefaultSettings
);

router.get(
  '/:key',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  validate(settingKeyParamSchema),
  settingsController.getSetting
);

router.put(
  '/:key',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  validate(upsertSettingSchema),
  settingsController.upsertSetting
);

router.delete(
  '/:key',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  validate(settingKeyParamSchema),
  settingsController.deleteSetting
);

export default router;
