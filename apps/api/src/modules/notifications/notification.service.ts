import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { CreateNotificationInput } from './notification.schemas';
import type { NotificationType } from '@prisma/client';

export class NotificationService {
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where: { userId } }),
    ]);

    return { notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUnreadCount(userId: string) {
    const count = await db.notification.count({
      where: { userId, read: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== userId) {
      throw new BadRequestError('Notification does not belong to user');
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    logger.info('Notification marked as read:', { notificationId, userId });
    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    logger.info('All notifications marked as read:', { userId, count: result.count });
    return { markedAsRead: result.count };
  }

  async createNotification(data: CreateNotificationInput) {
    const user = await db.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new NotFoundError('User');

    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      },
    });

    logger.info('Notification created:', { notificationId: notification.id, userId: data.userId, type: data.type });
    return notification;
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== userId) {
      throw new BadRequestError('Notification does not belong to user');
    }

    await db.notification.delete({
      where: { id: notificationId },
    });

    logger.info('Notification deleted:', { notificationId, userId });
    return { deleted: true };
  }

  // Helper methods for common notification types
  async sendPaymentReminder(userId: string, loanId: string, amount: number, dueDate: Date) {
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dueDate);

    return this.createNotification({
      userId,
      type: 'PAYMENT_REMINDER',
      title: 'Rappel de paiement',
      message: `Votre paiement de ${formattedAmount} est dû le ${formattedDate}. Veuillez effectuer votre paiement à temps pour éviter les frais de retard.`,
      metadata: { loanId, amount, dueDate: dueDate.toISOString() },
    });
  }

  async sendLoanStatusNotification(userId: string, loanId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const type: NotificationType = status === 'APPROVED' ? 'LOAN_APPROVED' : 'LOAN_REJECTED';
    const title = status === 'APPROVED' ? 'Prêt approuvé' : 'Prêt rejeté';
    const message =
      status === 'APPROVED'
        ? 'Félicitations ! Votre demande de prêt a été approuvée. Les fonds seront bientôt disponibles sur votre compte.'
        : `Votre demande de prêt a été rejetée. ${reason ? `Raison: ${reason}` : 'Veuillez contacter le support pour plus d\'informations.'}`;

    return this.createNotification({
      userId,
      type,
      title,
      message,
      metadata: { loanId, status, reason },
    });
  }

  async sendKYCStatusNotification(userId: string, documentId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const type: NotificationType = status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED';
    const title = status === 'APPROVED' ? 'Document KYC approuvé' : 'Document KYC rejeté';
    const message =
      status === 'APPROVED'
        ? 'Votre document KYC a été vérifié et approuvé avec succès.'
        : `Votre document KYC a été rejeté. ${reason ? `Raison: ${reason}` : 'Veuillez soumettre un nouveau document.'}`;

    return this.createNotification({
      userId,
      type,
      title,
      message,
      metadata: { documentId, status, reason },
    });
  }

  async sendCreditScoreNotification(userId: string, oldScore: number, newScore: number) {
    const change = newScore - oldScore;
    const direction = change > 0 ? 'augmenté' : 'diminué';
    const emoji = change > 0 ? '📈' : '📉';

    return this.createNotification({
      userId,
      type: 'CREDIT_SCORE_UPDATED',
      title: 'Score de crédit mis à jour',
      message: `Votre score de crédit a ${direction} de ${oldScore} à ${newScore} points. ${change > 0 ? 'Continuez vos bons efforts !' : 'Effectuez vos paiements à temps pour améliorer votre score.'}`,
      metadata: { oldScore, newScore, change },
    });
  }

  async sendPaymentSuccessNotification(userId: string, loanId: string, paymentId: string, amount: number) {
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);

    return this.createNotification({
      userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Paiement réussi',
      message: `Votre paiement de ${formattedAmount} a été traité avec succès. Merci !`,
      metadata: { loanId, paymentId, amount },
    });
  }

  async sendPaymentFailedNotification(userId: string, loanId: string, paymentId: string, amount: number, reason?: string) {
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);

    return this.createNotification({
      userId,
      type: 'PAYMENT_FAILED',
      title: 'Échec du paiement',
      message: `Votre paiement de ${formattedAmount} a échoué. ${reason ? `Raison: ${reason}` : 'Veuillez réessayer ou contacter le support.'}`,
      metadata: { loanId, paymentId, amount, reason },
    });
  }
}

export const notificationService = new NotificationService();
