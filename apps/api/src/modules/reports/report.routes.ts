import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';

const router = Router();

// All report routes require admin authentication
router.get(
  '/financial',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'),
  reportController.getFinancialSummary
);

router.get(
  '/loans',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'FINANCE'),
  reportController.getLoanAnalytics
);

router.get(
  '/drivers',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  reportController.getDriverAnalytics
);

router.get(
  '/payments',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'),
  reportController.getPaymentAnalytics
);

router.get(
  '/revenue',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'),
  reportController.getRevenueByPeriod
);

router.get(
  '/dashboard',
  authenticateAdmin,
  reportController.getDashboardStats
);

export default router;
