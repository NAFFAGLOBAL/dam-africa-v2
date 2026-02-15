import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { yangoFleetService } from '../../integrations/yango/yango.service';

/**
 * Credit Score Calculation Formula
 * 
 * Total Score = (
 *   Payment History Score × 0.35 +
 *   Loan Utilization Score × 0.30 +
 *   Account Age Score × 0.15 +
 *   Driving Performance Score × 0.10 +
 *   KYC Completeness Score × 0.10
 * )
 */

export class CreditService {
  /**
   * Calculate payment history score (0-1000)
   */
  private async calculatePaymentHistoryScore(userId: string): Promise<number> {
    const payments = await db.payment.findMany({
      where: {
        userId,
        status: { in: ['SUCCESS', 'FAILED'] },
      },
      include: {
        schedule: true,
      },
    });

    if (payments.length === 0) {
      return 500; // Default for no history
    }

    let onTimeCount = 0;
    let lateCount = 0;
    let missedCount = 0;

    for (const payment of payments) {
      if (!payment.schedule) continue;

      if (payment.status === 'SUCCESS') {
        const paymentDate = new Date(payment.createdAt);
        const dueDate = new Date(payment.schedule.dueDate);
        const daysDiff = Math.floor(
          (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 0) {
          onTimeCount++;
        } else if (daysDiff <= 7) {
          lateCount++;
        } else {
          missedCount++;
        }
      } else if (payment.status === 'FAILED') {
        missedCount++;
      }
    }

    const totalPayments = onTimeCount + lateCount + missedCount;
    const onTimePercentage = (onTimeCount / totalPayments) * 100;

    // Score based on on-time percentage
    if (onTimePercentage >= 100) return 1000;
    if (onTimePercentage >= 95) return 900;
    if (onTimePercentage >= 90) return 800;
    if (onTimePercentage >= 80) return 600;
    if (onTimePercentage >= 70) return 400;
    return 200;
  }

  /**
   * Calculate loan utilization score (0-1000)
   */
  private async calculateLoanUtilizationScore(userId: string): Promise<number> {
    const activeLoans = await db.loan.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (activeLoans.length === 0) {
      return 800; // Good score for no active loans
    }

    // Calculate total utilization
    let totalBorrowed = 0;
    let totalRepaid = 0;

    for (const loan of activeLoans) {
      totalBorrowed += Number(loan.amount);
      totalRepaid += Number(loan.amountPaid);
    }

    const utilizationPercentage =
      totalBorrowed > 0 ? ((totalBorrowed - totalRepaid) / totalBorrowed) * 100 : 0;

    // Score based on utilization
    if (utilizationPercentage <= 25) return 1000;
    if (utilizationPercentage <= 50) return 800;
    if (utilizationPercentage <= 75) return 600;
    if (utilizationPercentage <= 100) return 400;
    return 200; // Over-leveraged
  }

  /**
   * Calculate account age score (0-1000)
   */
  private calculateAccountAgeScore(createdAt: Date): number {
    const now = new Date();
    const ageInDays = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Score based on account age
    if (ageInDays >= 730) return 1000; // 2+ years
    if (ageInDays >= 365) return 800; // 1-2 years
    if (ageInDays >= 180) return 600; // 6-12 months
    if (ageInDays >= 90) return 400; // 3-6 months
    return 200; // < 3 months
  }

  /**
   * Calculate driving performance score (0-1000)
   * Integrates with Yango Fleet API for real driver performance data
   */
  private async calculateDrivingPerformanceScore(userId: string): Promise<number> {
    if (!yangoFleetService.isEnabled()) {
      return 500; // Default score when Yango is not available
    }

    try {
      // Get user's phone to match with Yango driver
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (!user) {
        return 500;
      }

      // Get all drivers from Yango
      const drivers = await yangoFleetService.getDrivers();
      const driver = drivers.find((d) => d.phone === user.phone);

      if (!driver) {
        return 500; // User not found in Yango fleet
      }

      // Get driver performance metrics
      const performance = await yangoFleetService.getDriverPerformance(driver.driver_profile_id);

      // Calculate score based on performance metrics
      let score = 0;

      // Rating component (0-400 points)
      if (performance.average_rating >= 4.8) score += 400;
      else if (performance.average_rating >= 4.5) score += 350;
      else if (performance.average_rating >= 4.0) score += 250;
      else if (performance.average_rating >= 3.5) score += 150;
      else score += 50;

      // Acceptance rate component (0-300 points)
      if (performance.acceptance_rate >= 0.95) score += 300;
      else if (performance.acceptance_rate >= 0.90) score += 250;
      else if (performance.acceptance_rate >= 0.80) score += 200;
      else if (performance.acceptance_rate >= 0.70) score += 100;
      else score += 50;

      // Trip completion component (0-300 points)
      const completionRate =
        performance.total_trips > 0
          ? performance.completed_trips / performance.total_trips
          : 0;
      if (completionRate >= 0.95) score += 300;
      else if (completionRate >= 0.90) score += 250;
      else if (completionRate >= 0.80) score += 200;
      else if (completionRate >= 0.70) score += 100;
      else score += 50;

      logger.info('Driving performance score calculated from Yango:', {
        userId,
        driverId: driver.driver_profile_id,
        score,
        performance,
      });

      return Math.min(score, 1000); // Cap at 1000
    } catch (error: any) {
      logger.error('Failed to calculate driving performance from Yango:', {
        userId,
        error: error.message,
      });
      return 500; // Default score on error
    }
  }

  /**
   * Calculate KYC completeness score (0-1000)
   */
  private async calculateKYCCompletenessScore(userId: string): Promise<number> {
    const kycDocuments = await db.kYCDocument.findMany({
      where: { userId },
    });

    if (kycDocuments.length === 0) {
      return 0; // No documents submitted
    }

    const approvedDocs = kycDocuments.filter((doc: any) => doc.status === 'APPROVED');

    // Check for key documents
    const hasIDCard = approvedDocs.some(
      (doc: any) => doc.documentType === 'ID_CARD' || doc.documentType === 'PASSPORT'
    );
    const hasDriversLicense = approvedDocs.some((doc: any) => doc.documentType === 'DRIVERS_LICENSE');
    const hasSelfie = approvedDocs.some((doc: any) => doc.documentType === 'SELFIE');

    if (hasIDCard && hasDriversLicense && hasSelfie) {
      return 1000; // All key documents verified
    }

    if (hasIDCard && hasDriversLicense) {
      return 700; // ID and license verified
    }

    if (hasIDCard) {
      return 600; // Only ID verified
    }

    // Some documents pending
    if (kycDocuments.some((doc: any) => doc.status === 'PENDING')) {
      return 300;
    }

    return 0;
  }

  /**
   * Determine credit rating based on score
   */
  private getCreditRating(score: number): string {
    if (score >= 800) return 'A';
    if (score >= 650) return 'B';
    if (score >= 500) return 'C';
    if (score >= 350) return 'D';
    return 'E';
  }

  /**
   * Calculate comprehensive credit score
   */
  async calculateCreditScore(userId: string): Promise<{
    score: number;
    rating: string;
    breakdown: {
      paymentHistory: number;
      loanUtilization: number;
      accountAge: number;
      drivingPerformance: number;
      kycCompleteness: number;
    };
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Calculate individual components
    const paymentHistoryScore = await this.calculatePaymentHistoryScore(userId);
    const loanUtilizationScore = await this.calculateLoanUtilizationScore(userId);
    const accountAgeScore = this.calculateAccountAgeScore(user.createdAt);
    const drivingPerformanceScore = await this.calculateDrivingPerformanceScore(userId);
    const kycCompletenessScore = await this.calculateKYCCompletenessScore(userId);

    // Calculate weighted total score
    const totalScore = Math.round(
      paymentHistoryScore * 0.35 +
        loanUtilizationScore * 0.3 +
        accountAgeScore * 0.15 +
        drivingPerformanceScore * 0.1 +
        kycCompletenessScore * 0.1
    );

    const rating = this.getCreditRating(totalScore);

    return {
      score: totalScore,
      rating,
      breakdown: {
        paymentHistory: paymentHistoryScore,
        loanUtilization: loanUtilizationScore,
        accountAge: accountAgeScore,
        drivingPerformance: drivingPerformanceScore,
        kycCompleteness: kycCompletenessScore,
      },
    };
  }

  /**
   * Recalculate and update user's credit score
   */
  async recalculateCreditScore(
    userId: string,
    reason?: string
  ): Promise<{
    score: number;
    rating: string;
    previousScore: number;
    previousRating: string;
    change: number;
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const previousScore = user.creditScore;
    const previousRating = user.creditRating || 'C';

    // Calculate new score
    const result = await this.calculateCreditScore(userId);

    // Update user's credit score
    await db.user.update({
      where: { id: userId },
      data: {
        creditScore: result.score,
        creditRating: result.rating,
      },
    });

    // Record in history
    await db.creditScoreHistory.create({
      data: {
        userId,
        score: result.score,
        rating: result.rating,
        changeReason: reason || 'Automatic recalculation',
        paymentHistoryScore: result.breakdown.paymentHistory,
        loanUtilizationScore: result.breakdown.loanUtilization,
        accountAgeScore: result.breakdown.accountAge,
        drivingPerformanceScore: result.breakdown.drivingPerformance,
        kycCompletenessScore: result.breakdown.kycCompleteness,
      },
    });

    // Log score change
    logger.info('Credit score recalculated:', {
      userId,
      previousScore,
      newScore: result.score,
      change: result.score - previousScore,
      reason,
    });

    return {
      score: result.score,
      rating: result.rating,
      previousScore,
      previousRating,
      change: result.score - previousScore,
    };
  }

  /**
   * Get user's current credit score and breakdown
   */
  async getCreditScore(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        creditScore: true,
        creditRating: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get latest history entry for breakdown
    const latestHistory = await db.creditScoreHistory.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      score: user.creditScore,
      rating: user.creditRating,
      breakdown: latestHistory
        ? {
            paymentHistory: latestHistory.paymentHistoryScore || 0,
            loanUtilization: latestHistory.loanUtilizationScore || 0,
            accountAge: latestHistory.accountAgeScore || 0,
            drivingPerformance: latestHistory.drivingPerformanceScore || 0,
            kycCompleteness: latestHistory.kycCompletenessScore || 0,
          }
        : null,
    };
  }

  /**
   * Get credit score history
   */
  async getCreditScoreHistory(userId: string, limit: number = 10) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const history = await db.creditScoreHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return history;
  }

  /**
   * Get maximum loan amount based on credit rating
   */
  getMaxLoanAmount(rating: string): number {
    const limits: Record<string, number> = {
      A: 2000000, // 2M XOF
      B: 1500000, // 1.5M XOF
      C: 1000000, // 1M XOF
      D: 500000, // 500K XOF
      E: 0, // Not eligible
    };

    return limits[rating] || 0;
  }

  /**
   * Get interest rate based on credit rating
   */
  getInterestRate(rating: string): number {
    const rates: Record<string, number> = {
      A: 12.0, // 12% annual
      B: 15.0, // 15% annual
      C: 18.0, // 18% annual
      D: 24.0, // 24% annual
      E: 0, // Not eligible
    };

    return rates[rating] || 0;
  }
}

export const creditService = new CreditService();
