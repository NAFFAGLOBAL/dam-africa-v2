/**
 * Payment Test Factory - DAM Africa V2
 */

import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePaymentOptions {
  loanId: string;
  userId: string;
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transactionReference?: string;
  processedAt?: Date;
}

export class PaymentFactory {
  private static counter = 0;

  /**
   * Generate unique transaction reference
   */
  static uniqueTransactionRef(): string {
    this.counter++;
    return `PAY-${Date.now()}-${this.counter}`;
  }

  /**
   * Create a payment
   */
  static async createPayment(options: CreatePaymentOptions) {
    return await prisma.payment.create({
      data: {
        loanId: options.loanId,
        userId: options.userId,
        amount: options.amount || 50000,
        method: options.method || 'MOBILE_MONEY',
        status: options.status || 'PENDING',
        transactionReference: options.transactionReference || this.uniqueTransactionRef(),
        processedAt: options.processedAt,
      },
      include: {
        loan: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Create a completed payment
   */
  static async createCompletedPayment(options: CreatePaymentOptions) {
    return await this.createPayment({
      ...options,
      status: 'COMPLETED',
      processedAt: new Date(),
    });
  }

  /**
   * Create a failed payment
   */
  static async createFailedPayment(options: CreatePaymentOptions) {
    return await this.createPayment({
      ...options,
      status: 'FAILED',
      processedAt: new Date(),
    });
  }

  /**
   * Create multiple payments for a loan
   */
  static async createPayments(
    loanId: string,
    userId: string,
    count: number,
    options: Partial<CreatePaymentOptions> = {}
  ) {
    const payments = [];
    for (let i = 0; i < count; i++) {
      const payment = await this.createPayment({
        loanId,
        userId,
        amount: options.amount || 50000,
        ...options,
      });
      payments.push(payment);
    }
    return payments;
  }

  /**
   * Reset factory counter
   */
  static reset() {
    this.counter = 0;
  }
}
