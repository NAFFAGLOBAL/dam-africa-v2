import { Router } from 'express';
import { notificationController } from './notification.controller';
import { validate } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import {
  notificationIdParamSchema,
  listNotificationsQuerySchema,
} from './notification.schemas';

const router = Router();

router.get(
  '/',
  authenticateUser,
  validate(listNotificationsQuerySchema),
  notificationController.getUserNotifications
);

router.get(
  '/unread-count',
  authenticateUser,
  notificationController.getUnreadCount
);

router.post(
  '/:id/read',
  authenticateUser,
  validate(notificationIdParamSchema),
  notificationController.markAsRead
);

router.post(
  '/read-all',
  authenticateUser,
  notificationController.markAllAsRead
);

router.delete(
  '/:id',
  authenticateUser,
  validate(notificationIdParamSchema),
  notificationController.deleteNotification
);

export default router;
