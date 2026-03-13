import { Router } from 'express';
import { incomeController } from './income.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import { recordIncomeSchema, listIncomeQuerySchema, incomeIdParamSchema, bulkImportSchema } from './income.schemas';

const router = Router();

// User routes
router.post('/', authenticateUser, validateBody(recordIncomeSchema), incomeController.recordIncome);
router.get('/history', authenticateUser, validateQuery(listIncomeQuerySchema), incomeController.getIncomeHistory);
router.get('/stats', authenticateUser, incomeController.getIncomeStats);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listIncomeQuerySchema), incomeController.getIncomeHistory);
router.get('/users/:userId/stats', authenticateAdmin, incomeController.getIncomeStats);
router.post('/:id/verify', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'), validateParams(incomeIdParamSchema), incomeController.verifyIncome);
router.post('/bulk-import', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateBody(bulkImportSchema), incomeController.bulkImportIncome);

export default router;
