import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticateUser, authenticateAdmin } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schemas';

const router = Router();

// =================================================================
// PUBLIC ROUTES (with rate limiting)
// =================================================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * @route   POST /api/v1/auth/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post(
  '/admin/login',
  authLimiter,
  validate(adminLoginSchema),
  authController.adminLogin
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout (client-side token removal)
 * @access  Public
 */
router.post(
  '/logout',
  authController.logout
);

// =================================================================
// PROTECTED ROUTES (User)
// =================================================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private (User)
 */
router.get(
  '/me',
  authenticateUser,
  authController.getCurrentUser
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private (User)
 */
router.post(
  '/change-password',
  authenticateUser,
  validate(changePasswordSchema),
  authController.changePassword
);

// =================================================================
// PROTECTED ROUTES (Admin)
// =================================================================

/**
 * @route   GET /api/v1/auth/admin/me
 * @desc    Get current admin profile
 * @access  Private (Admin)
 */
router.get(
  '/admin/me',
  authenticateAdmin,
  authController.getCurrentAdmin
);

export default router;
