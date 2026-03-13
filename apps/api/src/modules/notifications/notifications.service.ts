import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class NotificationsService {
  async getNotifications(userId: string, params: {
    page: number;
    limit: number;
    isRead?: boolean;
    type?: string;
  }) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (params.isRead !== undefined) where.isRead = params.isRead;
    if (params.type) where.type = params.type as Prisma.EnumNotificationTypeFilter['equals'];

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async markRead(id: string, userId: string) {
    const notification = await db.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundError('Notification introuvable');

    return db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    const result = await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await db.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await db.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundError('Notification introuvable');

    await db.notification.delete({ where: { id } });
  }

  // Helper to create notifications (used by other services)
  async createNotification(userId: string, type: string, title: string, body: string, data?: unknown) {
    return db.notification.create({
      data: {
        userId,
        type: type as Prisma.EnumNotificationTypeFilter['equals'],
        title,
        body,
        data: data as Prisma.InputJsonValue,
      },
    });
  }
}

export const notificationsService = new NotificationsService();
