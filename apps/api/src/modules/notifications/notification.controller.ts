import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type { ListNotificationsQuery } from './notification.schemas';

export class NotificationController {
  getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const query = req.query as unknown as ListNotificationsQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const result = await notificationService.getUserNotifications(userId, page, limit);
    sendPaginated(res, result.notifications, result.pagination.page, result.pagination.limit, result.pagination.total);
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationService.getUnreadCount(userId);
    sendSuccess(res, result);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, userId);
    sendSuccess(res, notification, 'Notification marquée comme lue');
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationService.markAllAsRead(userId);
    sendSuccess(res, result, 'Toutes les notifications ont été marquées comme lues');
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id, userId);
    sendSuccess(res, result, 'Notification supprimée avec succès');
  });
}

export const notificationController = new NotificationController();
