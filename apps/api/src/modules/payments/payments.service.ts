import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

export class PaymentsService {
  async createPayment(userId: string, data: {
    loanId?: string;
    rentalId?: string;
    contractId?: string;
    amount: number;
    method: string;
    phone?: string;
    description?: string;
  }) {
    const reference = `PAY-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;

    return db.payment.create({
      data: {
        userId,
        loanId: data.loanId,
        rentalId: data.rentalId,
        contractId: data.contractId,
        amount: data.amount,
        currency: 'XOF',
        method: data.method as any,
        reference,
        phone: data.phone,
        description: data.description,
        status: 'PENDING',
      },
    });
  }

  async getPaymentById(id: string) {
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        loan: { select: { id: true, amount: true, status: true } },
      },
    });
    if (!payment) throw new NotFoundError('Paiement introuvable');
    return payment;
  }

  async listPayments(params: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    loanId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.PaymentWhereInput = {};
    if (params.status) where.status = params.status as any;
    if (params.userId) where.userId = params.userId;
    if (params.loanId) where.loanId = params.loanId;
    if (params.method) where.method = params.method as any;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async processPayment(id: string) {
    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundError('Paiement introuvable');
    if (payment.status !== 'PENDING') throw new BadRequestError('Ce paiement ne peut pas être traité');

    const updated = await db.payment.update({
      where: { id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });

    // Update loan paid amount if linked
    if (payment.loanId) {
      await db.loan.update({
        where: { id: payment.loanId },
        data: { paidAmount: { increment: payment.amount } },
      });

      // Update next due schedule item
      const nextSchedule = await db.loanSchedule.findFirst({
        where: { loanId: payment.loanId, status: 'PENDING' },
        orderBy: { installment: 'asc' },
      });
      if (nextSchedule) {
        await db.loanSchedule.update({
          where: { id: nextSchedule.id },
          data: { status: 'COMPLETED', paidAmount: payment.amount, paidAt: new Date() },
        });
      }
    }

    // Update contract paid amount if linked
    if (payment.contractId) {
      await db.contract.update({
        where: { id: payment.contractId },
        data: {
          paidAmount: { increment: payment.amount },
          paidInstallments: { increment: 1 },
        },
      });
    }

    return updated;
  }

  async getPaymentHistory(userId: string) {
    return db.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async reconcilePayments(adminId: string, paymentIds: string[]) {
    const result = await db.payment.updateMany({
      where: { id: { in: paymentIds }, status: 'COMPLETED', reconciledAt: null },
      data: { reconciledAt: new Date(), reconciledBy: adminId },
    });
    return { reconciled: result.count };
  }
}

export const paymentsService = new PaymentsService();
