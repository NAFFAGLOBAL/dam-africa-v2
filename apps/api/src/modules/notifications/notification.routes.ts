import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.get('/', authenticateUser, async (req, res) => {
  sendSuccess(res, [], 'Notifications module - Coming in Phase 2');
});

export default router;
