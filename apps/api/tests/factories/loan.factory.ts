/**
 * Loan Test Factory - DAM Africa V2
 */

import { PrismaClient, LoanStatus, LoanPurpose } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateLoanOptions {
  userId: string;
  vehicleId?: string;
  amount?: number;
  interestRate?: number;
  termMonths?: number;
  purpose?: LoanPurpose;
  status?: LoanStatus;
  approvedById?: string;
  disbursedAt?: Date;
}

export class LoanFactory {
  /**
   * Create a loan
   */
  static async createLoan(options: CreateLoanOptions) {
    const amount = options.amount || 500000;
    const interestRate = options.interestRate || 15;
    const termMonths = options.termMonths || 12;

    // Calculate monthly payment using standard loan formula
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = Math.round(
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );

    const totalAmount = monthlyPayment * termMonths;

    return await prisma.loan.create({
      data: {
        userId: options.userId,
        vehicleId: options.vehicleId,
        amount,
        interestRate,
        termMonths,
        monthlyPayment,
        totalAmount,
        purpose: options.purpose || 'VEHICLE_PURCHASE',
        status: options.status || 'PENDING',
        approvedById: options.approvedById,
        disbursedAt: options.disbursedAt,
        remainingBalance: amount,
        nextPaymentDate: options.disbursedAt ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
      include: {
        user: true,
        vehicle: true,
      },
    });
  }

  /**
   * Create an approved loan
   */
  static async createApprovedLoan(options: CreateLoanOptions) {
    return await this.createLoan({
      ...options,
      status: 'APPROVED',
    });
  }

  /**
   * Create an active loan (disbursed)
   */
  static async createActiveLoan(options: CreateLoanOptions) {
    return await this.createLoan({
      ...options,
      status: 'ACTIVE',
      disbursedAt: new Date(),
    });
  }

  /**
   * Create a completed loan (fully paid)
   */
  static async createCompletedLoan(options: CreateLoanOptions) {
    return await this.createLoan({
      ...options,
      status: 'COMPLETED',
      disbursedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    });
  }

  /**
   * Create an overdue loan
   */
  static async createOverdueLoan(options: CreateLoanOptions) {
    return await this.createLoan({
      ...options,
      status: 'ACTIVE',
      disbursedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    });
  }

  /**
   * Create multiple loans for a user
   */
  static async createLoans(userId: string, count: number, options: Partial<CreateLoanOptions> = {}) {
    const loans = [];
    for (let i = 0; i < count; i++) {
      const loan = await this.createLoan({
        userId,
        amount: options.amount || 500000 + i * 100000,
        ...options,
      });
      loans.push(loan);
    }
    return loans;
  }
}
