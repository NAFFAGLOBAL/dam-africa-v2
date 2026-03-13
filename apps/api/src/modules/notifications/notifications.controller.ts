import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendPaginated, sendNoContent } from '../../utils/response';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, isRead, type } = req.query as unknown as {
      page: number; limit: number; isRead?: boolean; type?: string;
    };
    const { notifications, total } = await notificationsService.getNotifications(req.user!.id, { page, limit, isRead, type });
    sendPaginated(res, notifications, page, limit, total);
  });

  markRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationsService.markRead(req.params.id, req.user!.id);
    sendSuccess(res, notification);
  });

  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAllRead(req.user!.id);
    sendSuccess(res, result, 'Toutes les notifications marquées comme lues');
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.getUnreadCount(req.user!.id);
    sendSuccess(res, result);
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.deleteNotification(req.params.id, req.user!.id);
    sendNoContent(res);
  });
}

export const notificationsController = new NotificationsController();
