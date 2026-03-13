import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { reportQuerySchema, exportQuerySchema } from './reports.schemas';

const router = Router();

router.get('/revenue', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'), validateQuery(reportQuerySchema), reportsController.getRevenueReport);
router.get('/payments', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'), validateQuery(reportQuerySchema), reportsController.getPaymentReport);
router.get('/drivers', authenticateAdmin, validateQuery(reportQuerySchema), reportsController.getDriverReport);
router.get('/fleet', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateQuery(reportQuerySchema), reportsController.getFleetReport);
router.get('/loans', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'FINANCE'), validateQuery(reportQuerySchema), reportsController.getLoanReport);
router.get('/export', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateQuery(exportQuerySchema), reportsController.exportReport);

export default router;
