import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateParams } from '../../middleware/validate';
import {
  updateSettingSchema,
  settingKeyParamSchema,
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  featureFlagIdParamSchema,
} from './settings.schemas';

const router = Router();

// Settings
router.get('/', authenticateAdmin, settingsController.getSettings);
router.put('/:key', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(settingKeyParamSchema), validateBody(updateSettingSchema), settingsController.updateSetting);

// Feature flags
router.get('/feature-flags', authenticateAdmin, settingsController.getFeatureFlags);
router.post('/feature-flags', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateBody(createFeatureFlagSchema), settingsController.createFeatureFlag);
router.patch('/feature-flags/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(featureFlagIdParamSchema), validateBody(updateFeatureFlagSchema), settingsController.updateFeatureFlag);
router.post('/feature-flags/:id/toggle', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(featureFlagIdParamSchema), settingsController.toggleFeatureFlag);

export default router;
