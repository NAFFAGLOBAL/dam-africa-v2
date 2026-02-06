import { Router } from 'express';
import { creditController } from './credit.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';

const router = Router();

// =================================================================
// USER ROUTES
// =================================================================

/**
 * @route   GET /api/v1/credit/score
 * @desc    Get current user's credit score
 * @access  Private (User)
 */
router.get('/score', authenticateUser, creditController.getCreditScore);

/**
 * @route   GET /api/v1/credit/history
 * @desc    Get credit score history
 * @access  Private (User)
 */
router.get('/history', authenticateUser, creditController.getCreditHistory);

// =================================================================
// ADMIN ROUTES
// =================================================================

/**
 * @route   GET /api/v1/credit/admin/:userId
 * @desc    Get user's credit score (Admin)
 * @access  Private (Admin)
 */
router.get(
  '/admin/:userId',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  creditController.getUserCreditScore
);

/**
 * @route   POST /api/v1/credit/admin/:userId/recalculate
 * @desc    Recalculate user's credit score
 * @access  Private (Admin)
 */
router.post(
  '/admin/:userId/recalculate',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  creditController.recalculateCreditScore
);

export default router;
