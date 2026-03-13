import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { authRateLimit } from '../../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schemas';

const router = Router();

router.post('/register', authRateLimit, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimit, validateBody(loginSchema), authController.login);
router.post('/admin/login', authRateLimit, validateBody(adminLoginSchema), authController.adminLogin);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/change-password', authenticateUser, validateBody(changePasswordSchema), authController.changePassword);
router.post('/logout', authenticateUser, authController.logout);

export default router;
