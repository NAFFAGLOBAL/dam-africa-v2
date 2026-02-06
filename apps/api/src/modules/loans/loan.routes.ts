import { Router } from 'express';
import { loanController } from './loan.controller';
import { validate } from '../../middleware/validate';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import {
  applyForLoanSchema,
  approveLoanSchema,
  rejectLoanSchema,
  listLoansQuerySchema,
  loanIdParamSchema,
} from './loan.schemas';

const router = Router();

// =================================================================
// USER ROUTES
// =================================================================

/**
 * @route   GET /api/v1/loans/eligibility
 * @desc    Check loan eligibility
 * @access  Private (User)
 */
router.get(
  '/eligibility',
  authenticateUser,
  loanController.checkEligibility
);

/**
 * @route   POST /api/v1/loans/apply
 * @desc    Apply for a loan
 * @access  Private (User)
 */
router.post(
  '/apply',
  authenticateUser,
  validate(applyForLoanSchema),
  loanController.applyForLoan
);

/**
 * @route   GET /api/v1/loans/my-loans
 * @desc    Get user's loans
 * @access  Private (User)
 */
router.get(
  '/my-loans',
  authenticateUser,
  loanController.getMyLoans
);

/**
 * @route   GET /api/v1/loans/:loanId
 * @desc    Get loan by ID
 * @access  Private (User/Admin)
 */
router.get(
  '/:loanId',
  authenticateUser,
  validate(loanIdParamSchema),
  loanController.getLoanById
);

/**
 * @route   GET /api/v1/loans/:loanId/schedule
 * @desc    Get loan payment schedule
 * @access  Private (User/Admin)
 */
router.get(
  '/:loanId/schedule',
  authenticateUser,
  validate(loanIdParamSchema),
  loanController.getLoanSchedule
);

// =================================================================
// ADMIN ROUTES
// =================================================================

/**
 * @route   GET /api/v1/loans/admin/list
 * @desc    List all loans with filters
 * @access  Private (Admin)
 */
router.get(
  '/admin/list',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(listLoansQuerySchema),
  loanController.listLoans
);

/**
 * @route   POST /api/v1/loans/admin/:loanId/approve
 * @desc    Approve loan application
 * @access  Private (Admin/Loan Officer)
 */
router.post(
  '/admin/:loanId/approve',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(loanIdParamSchema),
  validate(approveLoanSchema),
  loanController.approveLoan
);

/**
 * @route   POST /api/v1/loans/admin/:loanId/reject
 * @desc    Reject loan application
 * @access  Private (Admin/Loan Officer)
 */
router.post(
  '/admin/:loanId/reject',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(loanIdParamSchema),
  validate(rejectLoanSchema),
  loanController.rejectLoan
);

/**
 * @route   POST /api/v1/loans/admin/:loanId/disburse
 * @desc    Disburse approved loan
 * @access  Private (Admin/Finance)
 */
router.post(
  '/admin/:loanId/disburse',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'),
  validate(loanIdParamSchema),
  loanController.disburseLoan
);

export default router;
