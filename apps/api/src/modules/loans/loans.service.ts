import { db } from '../../utils/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class LoansService {
  async checkEligibility(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');
    if (!user.isVerified) {
      return { eligible: false, reason: 'KYC non vérifié', maxAmount: 0, interestRate: 0 };
    }

    const activeLoans = await db.loan.count({
      where: { userId, status: { in: ['ACTIVE', 'DISBURSED'] } },
    });
    if (activeLoans > 0) {
      return { eligible: false, reason: 'Vous avez déjà un prêt actif', maxAmount: 0, interestRate: 0 };
    }

    const latestScore = await db.creditScoreHistory.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });

    const maxAmount = latestScore ? latestScore.maxLoanAmount : 500000;
    const interestRate = latestScore ? latestScore.interestRate : 15;

    return { eligible: true, maxAmount, interestRate, creditScore: latestScore?.score, creditRating: latestScore?.rating };
  }

  async applyForLoan(userId: string, data: { amount: number; termMonths: number; purpose?: string }) {
    const eligibility = await this.checkEligibility(userId);
    if (!eligibility.eligible) {
      throw new BadRequestError(eligibility.reason || 'Non éligible');
    }
    if (data.amount > eligibility.maxAmount) {
      throw new BadRequestError(`Le montant maximum est de ${eligibility.maxAmount} FCFA`);
    }

    const interestRate = eligibility.interestRate;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = (data.amount * monthlyRate * Math.pow(1 + monthlyRate, data.termMonths)) /
      (Math.pow(1 + monthlyRate, data.termMonths) - 1);
    const totalRepayment = monthlyPayment * data.termMonths;

    const user = await db.user.findUnique({ where: { id: userId }, select: { customerId: true } });

    const loan = await db.loan.create({
      data: {
        userId,
        customerId: user?.customerId,
        amount: data.amount,
        interestRate,
        termMonths: data.termMonths,
        monthlyPayment: Math.round(monthlyPayment),
        totalRepayment: Math.round(totalRepayment),
        purpose: data.purpose,
        creditScore: eligibility.creditScore,
        creditRating: eligibility.creditRating as Prisma.EnumCreditRatingFilter['equals'],
        status: 'PENDING',
      },
    });

    return loan;
  }

  async getMyLoans(userId: string) {
    return db.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLoanById(id: string) {
    const loan = await db.loan.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        schedule: { orderBy: { installment: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!loan) throw new NotFoundError('Prêt introuvable');
    return loan;
  }

  async getLoanSchedule(id: string) {
    const loan = await db.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundError('Prêt introuvable');

    return db.loanSchedule.findMany({
      where: { loanId: id },
      orderBy: { installment: 'asc' },
    });
  }

  async listLoans(params: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    customerId?: string;
  }) {
    const where: Prisma.LoanWhereInput = {};
    if (params.status) where.status = params.status as Prisma.EnumLoanStatusFilter['equals'];
    if (params.userId) where.userId = params.userId;
    if (params.customerId) where.customerId = params.customerId;

    const [loans, total] = await Promise.all([
      db.loan.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.loan.count({ where }),
    ]);

    return { loans, total };
  }

  async approveLoan(id: string, approvedBy: string) {
    const loan = await db.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundError('Prêt introuvable');
    if (loan.status !== 'PENDING') throw new BadRequestError('Ce prêt ne peut plus être approuvé');

    return db.loan.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy, approvedAt: new Date() },
    });
  }

  async rejectLoan(id: string, reason: string) {
    const loan = await db.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundError('Prêt introuvable');
    if (loan.status !== 'PENDING') throw new BadRequestError('Ce prêt ne peut plus être rejeté');

    return db.loan.update({
      where: { id },
      data: { status: 'REJECTED', rejectedReason: reason },
    });
  }

  async disburseLoan(id: string) {
    const loan = await db.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundError('Prêt introuvable');
    if (loan.status !== 'APPROVED') throw new BadRequestError('Ce prêt doit être approuvé avant le décaissement');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + loan.termMonths);

    // Create loan schedule
    const scheduleData = [];
    const monthlyRate = loan.interestRate / 100 / 12;
    let balance = loan.amount;
    for (let i = 1; i <= loan.termMonths; i++) {
      const interest = Math.round(balance * monthlyRate);
      const principal = Math.round(loan.monthlyPayment - interest);
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      scheduleData.push({
        loanId: id,
        installment: i,
        dueDate,
        amount: loan.monthlyPayment,
        principal,
        interest,
      });

      balance -= principal;
    }

    await db.loanSchedule.createMany({ data: scheduleData });

    return db.loan.update({
      where: { id },
      data: {
        status: 'DISBURSED',
        disbursedAt: new Date(),
        startDate,
        endDate,
      },
    });
  }
}

export const loansService = new LoansService();
