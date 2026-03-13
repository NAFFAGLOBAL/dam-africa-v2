import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import { updateProfileSchema, listUsersQuerySchema, userIdParamSchema } from './users.schemas';

const router = Router();

// User routes
router.get('/me', authenticateUser, usersController.getProfile);
router.patch('/me', authenticateUser, validateBody(updateProfileSchema), usersController.updateProfile);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listUsersQuerySchema), usersController.listUsers);
router.get('/:id', authenticateAdmin, validateParams(userIdParamSchema), usersController.getUserById);
router.post('/:id/suspend', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateParams(userIdParamSchema), usersController.suspendUser);
router.post('/:id/activate', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateParams(userIdParamSchema), usersController.activateUser);
router.delete('/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(userIdParamSchema), usersController.deleteUser);

export default router;
