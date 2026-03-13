import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { CreditRating } from '@prisma/client';

// Score 0-1000, weights: payment 40%, income 35%, driving 25%
const WEIGHTS = {
  payment: 0.40,
  income: 0.35,
  driving: 0.25,
};

function getRating(score: number): CreditRating {
  if (score >= 800) return 'A';
  if (score >= 650) return 'B';
  if (score >= 500) return 'C';
  if (score >= 350) return 'D';
  return 'E';
}

function getMaxLoanAmount(rating: CreditRating): number {
  const amounts: Record<CreditRating, number> = {
    A: 5000000,
    B: 3000000,
    C: 1500000,
    D: 500000,
    E: 0,
  };
  return amounts[rating];
}

function getInterestRateForRating(rating: CreditRating): number {
  const rates: Record<CreditRating, number> = {
    A: 8,
    B: 12,
    C: 15,
    D: 20,
    E: 25,
  };
  return rates[rating];
}

export class CreditService {
  async calculateScore(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    // Payment score (40%): ratio of on-time payments
    const payments = await db.payment.findMany({
      where: { userId, status: 'COMPLETED' },
    });
    const totalPayments = await db.payment.count({ where: { userId } });
    const completedPayments = payments.length;
    const paymentRatio = totalPayments > 0 ? completedPayments / totalPayments : 0.5;
    const paymentScore = Math.round(paymentRatio * 1000);

    // Income score (35%): based on recent 3 months income stability
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const incomeRecords = await db.incomeRecord.findMany({
      where: { userId, date: { gte: threeMonthsAgo } },
    });
    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const avgMonthlyIncome = totalIncome / 3;
    // Score: 500K+/month = 1000, 0 = 0
    const incomeScore = Math.min(1000, Math.round((avgMonthlyIncome / 500000) * 1000));

    // Driving score (25%): from driving behavior data
    const behaviors = await db.drivingBehavior.findMany({
      where: { driverId: userId },
      orderBy: { periodEnd: 'desc' },
      take: 5,
    });
    let drivingScore = 500; // default
    if (behaviors.length > 0) {
      const avgSafety = behaviors.reduce((sum, b) => sum + (b.safetyScore ?? 50), 0) / behaviors.length;
      drivingScore = Math.round(avgSafety * 10);
    }

    const totalScore = Math.round(
      paymentScore * WEIGHTS.payment +
      incomeScore * WEIGHTS.income +
      drivingScore * WEIGHTS.driving,
    );
    const clampedScore = Math.min(1000, Math.max(0, totalScore));
    const rating = getRating(clampedScore);
    const maxLoanAmount = getMaxLoanAmount(rating);
    const interestRate = getInterestRateForRating(rating);

    const record = await db.creditScoreHistory.create({
      data: {
        userId,
        score: clampedScore,
        rating,
        paymentScore,
        incomeScore,
        drivingScore,
        maxLoanAmount,
        interestRate,
        breakdown: {
          paymentScore,
          incomeScore,
          drivingScore,
          weights: WEIGHTS,
          avgMonthlyIncome,
          totalPayments,
          completedPayments,
        },
      },
    });

    return record;
  }

  async getScoreHistory(userId: string, page: number, limit: number) {
    const [records, total] = await Promise.all([
      db.creditScoreHistory.findMany({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.creditScoreHistory.count({ where: { userId } }),
    ]);
    return { records, total };
  }

  async getScoreBreakdown(userId: string) {
    const latest = await db.creditScoreHistory.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });
    if (!latest) throw new NotFoundError('Aucun score de crédit trouvé');
    return latest;
  }

  async recalculateScore(userId: string) {
    return this.calculateScore(userId);
  }

  async getMaxLoanAmount(userId: string) {
    const latest = await db.creditScoreHistory.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });
    if (!latest) {
      return { maxAmount: 0, interestRate: 25, rating: 'E', score: 0 };
    }
    return {
      maxAmount: latest.maxLoanAmount,
      interestRate: latest.interestRate,
      rating: latest.rating,
      score: latest.score,
    };
  }

  async getInterestRate(userId: string) {
    const latest = await db.creditScoreHistory.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });
    return { interestRate: latest?.interestRate ?? 25, rating: latest?.rating ?? 'E' };
  }
}

export const creditService = new CreditService();
