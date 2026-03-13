import { Router } from 'express';
import { creditController } from './credit.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateParams } from '../../middleware/validate';
import { userIdParamSchema } from './credit.schemas';

const router = Router();

// User routes
router.get('/my-score', authenticateUser, creditController.getMyScore);
router.get('/my-score/history', authenticateUser, creditController.getScoreHistory);
router.get('/my-score/max-loan', authenticateUser, creditController.getMaxLoanAmount);
router.get('/my-score/interest-rate', authenticateUser, creditController.getInterestRate);

// Admin routes
router.post('/users/:userId/calculate', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'), validateParams(userIdParamSchema), creditController.calculateScore);
router.get('/users/:userId/history', authenticateAdmin, validateParams(userIdParamSchema), creditController.getScoreHistory);
router.get('/users/:userId/breakdown', authenticateAdmin, validateParams(userIdParamSchema), creditController.getScoreBreakdown);
router.post('/users/:userId/recalculate', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'), validateParams(userIdParamSchema), creditController.recalculateScore);
router.get('/users/:userId/max-loan', authenticateAdmin, validateParams(userIdParamSchema), creditController.getMaxLoanAmount);
router.get('/users/:userId/interest-rate', authenticateAdmin, validateParams(userIdParamSchema), creditController.getInterestRate);

export default router;
