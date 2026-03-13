import { Router } from 'express';
import { loansController } from './loans.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import { applyForLoanSchema, listLoansQuerySchema, loanIdParamSchema, rejectLoanSchema } from './loans.schemas';

const router = Router();

// User routes
router.get('/eligibility', authenticateUser, loansController.checkEligibility);
router.post('/apply', authenticateUser, validateBody(applyForLoanSchema), loansController.applyForLoan);
router.get('/my-loans', authenticateUser, loansController.getMyLoans);
router.get('/:id', authenticateUser, validateParams(loanIdParamSchema), loansController.getLoanById);
router.get('/:id/schedule', authenticateUser, validateParams(loanIdParamSchema), loansController.getLoanSchedule);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listLoansQuerySchema), loansController.listLoans);
router.post('/:id/approve', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'), validateParams(loanIdParamSchema), loansController.approveLoan);
router.post('/:id/reject', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'), validateParams(loanIdParamSchema), validateBody(rejectLoanSchema), loansController.rejectLoan);
router.post('/:id/disburse', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'FINANCE'), validateParams(loanIdParamSchema), loansController.disburseLoan);

export default router;
