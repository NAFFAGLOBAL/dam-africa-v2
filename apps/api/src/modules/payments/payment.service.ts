import { db } from '../../utils/database';
import { creditService } from '../credit/credit.service';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { config } from '../../config';
import type { InitiatePaymentInput, ManualPaymentInput } from './payment.schemas';

export class PaymentService {
  async initiatePayment(userId: string, data: InitiatePaymentInput) {
    const loan = await db.loan.findUnique({
      where: { id: data.loanId },
      include: { user: true },
    });

    if (!loan) throw new NotFoundError('Loan');
    if (loan.userId !== userId) throw new BadRequestError('Loan does not belong to user');
    if (loan.status !== 'ACTIVE') throw new BadRequestError('Loan is not active');

    const outstanding = Number(loan.totalRepayment) - Number(loan.amountPaid);
    if (data.amount > outstanding) {
      throw new BadRequestError(`Amount exceeds outstanding balance of ${outstanding} XOF`);
    }

    const payment = await db.payment.create({
      data: {
        userId,
        loanId: data.loanId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        status: config.integrations.mockMode ? 'SUCCESS' : 'PENDING',
      },
    });

    if (config.integrations.mockMode) {
      await this.processSuccessfulPayment(payment.id);
    }

    logger.info('Payment initiated:', { paymentId: payment.id, userId, amount: data.amount });
    return payment;
  }

  async processSuccessfulPayment(paymentId: string) {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { loan: true },
    });

    if (!payment) throw new NotFoundError('Payment');

    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCESS', processedAt: new Date() },
      });

      const newAmountPaid = Number(payment.loan.amountPaid) + Number(payment.amount);
      const isCompleted = newAmountPaid >= Number(payment.loan.totalRepayment);

      await tx.loan.update({
        where: { id: payment.loanId },
        data: {
          amountPaid: newAmountPaid,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        },
      });

      const schedules = await tx.loanSchedule.findMany({
        where: { loanId: payment.loanId, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        orderBy: { weekNumber: 'asc' },
      });

      let remainingAmount = Number(payment.amount);
      for (const schedule of schedules) {
        if (remainingAmount <= 0) break;

        const due = Number(schedule.amountDue);
        const paid = Number(schedule.amountPaid);
        const outstanding = due - paid;

        if (outstanding > 0) {
          const toApply = Math.min(remainingAmount, outstanding);
          const newPaid = paid + toApply;

          await tx.loanSchedule.update({
            where: { id: schedule.id },
            data: {
              amountPaid: newPaid,
              status: newPaid >= due ? 'PAID' : 'PARTIAL',
              paidAt: newPaid >= due ? new Date() : null,
            },
          });

          await tx.payment.update({
            where: { id: paymentId },
            data: { scheduleId: schedule.id },
          });

          remainingAmount -= toApply;
        }
      }
    });

    await creditService.recalculateCreditScore(payment.userId, 'Payment processed');
    logger.info('Payment processed successfully:', { paymentId });
  }

  async getPaymentById(paymentId: string) {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, amount: true, status: true } },
        schedule: true,
      },
    });
    if (!payment) throw new NotFoundError('Payment');
    return payment;
  }

  async listPayments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string,
    loanId?: string,
    method?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (loanId) where.loanId = loanId;
    if (method) where.method = method;

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          loan: { select: { id: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.payment.count({ where }),
    ]);

    return { payments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUserPayments(userId: string) {
    return db.payment.findMany({
      where: { userId },
      include: { loan: { select: { id: true, amount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createManualPayment(data: ManualPaymentInput) {
    const loan = await db.loan.findUnique({ where: { id: data.loanId } });
    if (!loan) throw new NotFoundError('Loan');
    if (loan.status !== 'ACTIVE') throw new BadRequestError('Loan is not active');

    const payment = await db.payment.create({
      data: {
        userId: data.userId,
        loanId: data.loanId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        status: 'SUCCESS',
        processedAt: new Date(),
      },
    });

    await this.processSuccessfulPayment(payment.id);
    logger.info('Manual payment created:', { paymentId: payment.id, adminAction: true });
    return payment;
  }
}

export const paymentService = new PaymentService();
