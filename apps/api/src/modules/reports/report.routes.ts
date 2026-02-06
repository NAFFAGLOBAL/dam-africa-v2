import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.get('/dashboard', authenticateAdmin, async (req, res) => {
  sendSuccess(res, {}, 'Reports module - Coming in Phase 2');
});

export default router;
