import { db } from '../../utils/database';
import { creditService } from '../credit/credit.service';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { ApplyForLoanInput, ApproveLoanInput, RejectLoanInput } from './loan.schemas';

export class LoanService {
  /**
   * Check if user is eligible for a loan
   */
  async checkEligibility(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        loans: {
          where: {
            status: { in: ['ACTIVE', 'PENDING', 'APPROVED'] },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const reasons: string[] = [];
    let eligible = true;

    // Check 1: KYC Status
    if (user.kycStatus !== 'VERIFIED') {
      eligible = false;
      reasons.push('KYC verification required');
    }

    // Check 2: Credit Score
    if (user.creditScore < 350) {
      eligible = false;
      reasons.push('Credit score too low (minimum 350 required)');
    }

    // Check 3: Account Age (minimum 30 days)
    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (accountAgeDays < 30) {
      eligible = false;
      reasons.push(`Account must be at least 30 days old (current: ${accountAgeDays} days)`);
    }

    // Check 4: Active Loans (max 1 active loan)
    const activeLoans = user.loans.filter((loan) => loan.status === 'ACTIVE');
    if (activeLoans.length >= 1) {
      eligible = false;
      reasons.push('Maximum active loans limit reached');
    }

    // Check 5: Defaulted Loans
    const defaultedLoans = await db.loan.findFirst({
      where: {
        userId,
        status: 'DEFAULTED',
      },
    });
    if (defaultedLoans) {
      eligible = false;
      reasons.push('Cannot apply with defaulted loans');
    }

    // Check 6: Account Status
    if (user.status !== 'ACTIVE') {
      eligible = false;
      reasons.push('Account is suspended or deleted');
    }

    // Get max loan amount based on credit rating
    const maxLoanAmount = creditService.getMaxLoanAmount(user.creditRating || 'E');
    const interestRate = creditService.getInterestRate(user.creditRating || 'E');

    return {
      eligible,
      reasons,
      maxLoanAmount,
      interestRate,
      creditScore: user.creditScore,
      creditRating: user.creditRating,
      kycStatus: user.kycStatus,
      activeLoans: activeLoans.length,
    };
  }

  /**
   * Calculate loan repayment details
   */
  private calculateLoanDetails(amount: number, termWeeks: number, annualInterestRate: number) {
    // Calculate interest for the term
    const termYears = termWeeks / 52;
    const interestAmount = amount * (annualInterestRate / 100) * termYears;
    const totalRepayment = amount + interestAmount;
    const weeklyPayment = totalRepayment / termWeeks;

    return {
      principal: amount,
      interestAmount,
      totalRepayment,
      weeklyPayment,
      termWeeks,
      annualInterestRate,
    };
  }

  /**
   * Apply for a loan
   */
  async applyForLoan(userId: string, data: ApplyForLoanInput) {
    // Check eligibility
    const eligibility = await this.checkEligibility(userId);

    if (!eligibility.eligible) {
      throw new BadRequestError('Not eligible for loan', { reasons: eligibility.reasons });
    }

    // Check if requested amount exceeds maximum
    if (data.amount > eligibility.maxLoanAmount) {
      throw new BadRequestError(
        `Requested amount exceeds maximum loan amount of ${eligibility.maxLoanAmount} XOF`
      );
    }

    // Calculate loan details
    const loanDetails = this.calculateLoanDetails(
      data.amount,
      data.termWeeks,
      eligibility.interestRate
    );

    // Create loan application
    const loan = await db.loan.create({
      data: {
        userId,
        amount: data.amount,
        interestRate: eligibility.interestRate,
        termWeeks: data.termWeeks,
        totalRepayment: loanDetails.totalRepayment,
        weeklyPayment: loanDetails.weeklyPayment,
        purpose: data.purpose,
        status: 'PENDING',
      },
    });

    // Log loan application
    logger.info('Loan application created:', {
      loanId: loan.id,
      userId,
      amount: data.amount,
      termWeeks: data.termWeeks,
    });

    return {
      loan,
      calculations: loanDetails,
    };
  }

  /**
   * Get loan by ID
   */
  async getLoanById(loanId: string, includeSchedule: boolean = false) {
    const loan = await db.loan.findUnique({
      where: { id: loanId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            creditScore: true,
            creditRating: true,
            kycStatus: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        ...(includeSchedule && {
          schedule: {
            orderBy: { weekNumber: 'asc' },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        }),
      },
    });

    if (!loan) {
      throw new NotFoundError('Loan');
    }

    return loan;
  }

  /**
   * List loans with filters
   */
  async listLoans(
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [loans, total] = await Promise.all([
      db.loan.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              creditScore: true,
              creditRating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.loan.count({ where }),
    ]);

    return {
      loans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve loan (Admin only)
   */
  async approveLoan(loanId: string, adminId: string, data?: ApproveLoanInput) {
    const loan = await db.loan.findUnique({
      where: { id: loanId },
      include: { user: true },
    });

    if (!loan) {
      throw new NotFoundError('Loan');
    }

    if (loan.status !== 'PENDING') {
      throw new BadRequestError(`Cannot approve loan with status: ${loan.status}`);
    }

    // Use approved values or original values
    const finalAmount = data?.approvedAmount || Number(loan.amount);
    const finalTermWeeks = data?.termWeeks || loan.termWeeks;
    const finalInterestRate =
      data?.interestRate ||
      Number(loan.interestRate) ||
      creditService.getInterestRate(loan.user.creditRating || 'C');

    // Recalculate if values changed
    const loanDetails = this.calculateLoanDetails(finalAmount, finalTermWeeks, finalInterestRate);

    // Calculate start and end dates
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + finalTermWeeks * 7);

    // Update loan
    const updatedLoan = await db.loan.update({
      where: { id: loanId },
      data: {
        status: 'APPROVED',
        amount: finalAmount,
        termWeeks: finalTermWeeks,
        interestRate: finalInterestRate,
        totalRepayment: loanDetails.totalRepayment,
        weeklyPayment: loanDetails.weeklyPayment,
        approvedById: adminId,
        approvedAt: new Date(),
        startDate,
        endDate,
      },
    });

    // Create payment schedule
    await this.generatePaymentSchedule(loanId, startDate, finalTermWeeks, loanDetails.weeklyPayment);

    // Recalculate credit score (loan approved impacts score)
    await creditService.recalculateCreditScore(loan.userId, 'Loan approved');

    // Log approval
    logger.info('Loan approved:', {
      loanId,
      adminId,
      amount: finalAmount,
      termWeeks: finalTermWeeks,
    });

    return updatedLoan;
  }

  /**
   * Generate payment schedule for approved loan
   */
  private async generatePaymentSchedule(
    loanId: string,
    startDate: Date,
    termWeeks: number,
    weeklyPayment: number
  ) {
    const scheduleItems = [];

    for (let week = 1; week <= termWeeks; week++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + week * 7);

      scheduleItems.push({
        loanId,
        weekNumber: week,
        dueDate,
        amountDue: weeklyPayment,
        status: 'PENDING' as const,
      });
    }

    await db.loanSchedule.createMany({
      data: scheduleItems,
    });
  }

  /**
   * Reject loan (Admin only)
   */
  async rejectLoan(loanId: string, data: RejectLoanInput) {
    const loan = await db.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundError('Loan');
    }

    if (loan.status !== 'PENDING') {
      throw new BadRequestError(`Cannot reject loan with status: ${loan.status}`);
    }

    const updatedLoan = await db.loan.update({
      where: { id: loanId },
      data: {
        status: 'REJECTED',
        rejectionReason: data.reason,
      },
    });

    // Log rejection
    logger.info('Loan rejected:', {
      loanId,
      reason: data.reason,
    });

    return updatedLoan;
  }

  /**
   * Disburse approved loan (Admin only)
   */
  async disburseLoan(loanId: string) {
    const loan = await db.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundError('Loan');
    }

    if (loan.status !== 'APPROVED') {
      throw new BadRequestError(`Cannot disburse loan with status: ${loan.status}`);
    }

    const updatedLoan = await db.loan.update({
      where: { id: loanId },
      data: {
        status: 'ACTIVE',
        disbursedAt: new Date(),
      },
    });

    // Log disbursement
    logger.info('Loan disbursed:', {
      loanId,
      amount: loan.amount,
      userId: loan.userId,
    });

    return updatedLoan;
  }

  /**
   * Get user's loans
   */
  async getUserLoans(userId: string) {
    const loans = await db.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return loans;
  }

  /**
   * Get loan payment schedule
   */
  async getLoanSchedule(loanId: string) {
    const loan = await db.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundError('Loan');
    }

    const schedule = await db.loanSchedule.findMany({
      where: { loanId },
      orderBy: { weekNumber: 'asc' },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return schedule;
  }
}

export const loanService = new LoanService();
