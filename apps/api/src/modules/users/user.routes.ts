import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import {
  updateProfileSchema,
  listUsersQuerySchema,
  userIdParamSchema,
  suspendUserSchema,
} from './user.schemas';

const router = Router();

// =================================================================
// USER ROUTES
// =================================================================

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private (User)
 */
router.get(
  '/me',
  authenticateUser,
  userController.getMyProfile
);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private (User)
 */
router.put(
  '/me',
  authenticateUser,
  validate(updateProfileSchema),
  userController.updateMyProfile
);

/**
 * @route   GET /api/v1/users/me/stats
 * @desc    Get current user statistics
 * @access  Private (User)
 */
router.get(
  '/me/stats',
  authenticateUser,
  userController.getMyStats
);

// =================================================================
// ADMIN ROUTES
// =================================================================

/**
 * @route   GET /api/v1/users/admin/list
 * @desc    List all users with filters
 * @access  Private (Admin)
 */
router.get(
  '/admin/list',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'SUPPORT'),
  validate(listUsersQuerySchema),
  userController.listUsers
);

/**
 * @route   GET /api/v1/users/admin/:userId
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get(
  '/admin/:userId',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'SUPPORT'),
  validate(userIdParamSchema),
  userController.getUserById
);

/**
 * @route   GET /api/v1/users/admin/:userId/stats
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get(
  '/admin/:userId/stats',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(userIdParamSchema),
  userController.getUserStats
);

/**
 * @route   POST /api/v1/users/admin/:userId/suspend
 * @desc    Suspend user
 * @access  Private (Admin)
 */
router.post(
  '/admin/:userId/suspend',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(userIdParamSchema),
  validate(suspendUserSchema),
  userController.suspendUser
);

/**
 * @route   POST /api/v1/users/admin/:userId/activate
 * @desc    Activate user
 * @access  Private (Admin)
 */
router.post(
  '/admin/:userId/activate',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(userIdParamSchema),
  userController.activateUser
);

/**
 * @route   DELETE /api/v1/users/admin/:userId
 * @desc    Delete user (soft delete)
 * @access  Private (Super Admin only)
 */
router.delete(
  '/admin/:userId',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN'),
  validate(userIdParamSchema),
  userController.deleteUser
);

export default router;
