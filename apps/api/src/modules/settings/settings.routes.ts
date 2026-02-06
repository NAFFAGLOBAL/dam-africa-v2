import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.get('/', authenticateAdmin, async (req, res) => {
  sendSuccess(res, {}, 'Settings module - Coming in Phase 2');
});

export default router;
