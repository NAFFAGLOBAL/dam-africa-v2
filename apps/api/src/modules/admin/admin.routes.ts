import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';
import { db } from '../../utils/database';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.get('/dashboard', authenticateAdmin, asyncHandler(async (req, res) => {
  const [totalUsers, totalLoans, activeLoans, totalPayments] = await Promise.all([
    db.user.count(),
    db.loan.count(),
    db.loan.count({ where: { status: 'ACTIVE' } }),
    db.payment.count({ where: { status: 'SUCCESS' } }),
  ]);

  const stats = {
    users: { total: totalUsers },
    loans: { total: totalLoans, active: activeLoans },
    payments: { total: totalPayments },
  };

  sendSuccess(res, stats);
}));

export default router;
