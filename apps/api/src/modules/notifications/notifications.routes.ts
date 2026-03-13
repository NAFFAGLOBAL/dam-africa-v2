import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticateUser } from '../../middleware/auth';
import { validateQuery, validateParams } from '../../middleware/validate';
import { listNotificationsQuerySchema, notificationIdParamSchema } from './notifications.schemas';

const router = Router();

router.get('/', authenticateUser, validateQuery(listNotificationsQuerySchema), notificationsController.getNotifications);
router.get('/unread-count', authenticateUser, notificationsController.getUnreadCount);
router.post('/mark-all-read', authenticateUser, notificationsController.markAllRead);
router.post('/:id/read', authenticateUser, validateParams(notificationIdParamSchema), notificationsController.markRead);
router.delete('/:id', authenticateUser, validateParams(notificationIdParamSchema), notificationsController.deleteNotification);

export default router;
