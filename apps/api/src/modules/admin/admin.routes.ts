import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  createAdminSchema,
  updateAdminSchema,
  adminIdParamSchema,
  auditLogQuerySchema,
  updatePreferencesSchema,
} from './admin.schemas';

const router = Router();

router.get('/dashboard', authenticateAdmin, adminController.getDashboardStats);
router.get('/users', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), adminController.getAdminUsers);
router.post('/users', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateBody(createAdminSchema), adminController.createAdmin);
router.patch('/users/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(adminIdParamSchema), validateBody(updateAdminSchema), adminController.updateAdmin);
router.get('/audit-log', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateQuery(auditLogQuerySchema), adminController.getAuditLog);
router.get('/preferences', authenticateAdmin, adminController.getAdminPreferences);
router.patch('/preferences', authenticateAdmin, validateBody(updatePreferencesSchema), adminController.updateAdminPreferences);

export default router;
