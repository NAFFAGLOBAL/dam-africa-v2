import { db } from '../../utils/database';
import { logger } from '../../utils/logger';

export class ReportService {
  async getFinancialSummary(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalDisbursed,
      totalCollected,
      _totalOutstanding,
      activeLoans,
      completedLoans,
    ] = await Promise.all([
      db.loan.aggregate({
        where: { ...where, status: { in: ['ACTIVE', 'COMPLETED'] } },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      db.loan.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { totalRepayment: true, amountPaid: true },
      }),
      db.loan.findMany({
        where: { status: 'ACTIVE' },
        select: { totalRepayment: true, amountPaid: true },
      }),
      db.loan.count({ where: { ...where, status: 'COMPLETED' } }),
    ]);

    const disbursed = Number(totalDisbursed._sum.amount || 0);
    const collected = Number(totalCollected._sum.amount || 0);

    let outstanding = 0;
    for (const loan of activeLoans) {
      outstanding += Number(loan.totalRepayment) - Number(loan.amountPaid);
    }

    const revenue = collected - disbursed;
    const collectionRate = disbursed > 0 ? (collected / disbursed) * 100 : 0;

    logger.info('Financial summary generated:', { disbursed, collected, outstanding, revenue });

    return {
      totalDisbursed: disbursed,
      totalCollected: collected,
      totalOutstanding: outstanding,
      revenue,
      collectionRate: Number(collectionRate.toFixed(2)),
      completedLoans,
    };
  }

  async getLoanAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalLoans,
      loansByStatus,
      averageAmount,
      totalApplications,
      approvedCount,
      rejectedCount,
      defaultedCount,
    ] = await Promise.all([
      db.loan.count({ where }),
      db.loan.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      db.loan.aggregate({
        where,
        _avg: { amount: true },
      }),
      db.loan.count({ where }),
      db.loan.count({ where: { ...where, status: { in: ['APPROVED', 'ACTIVE', 'COMPLETED'] } } }),
      db.loan.count({ where: { ...where, status: 'REJECTED' } }),
      db.loan.count({ where: { ...where, status: 'DEFAULTED' } }),
    ]);

    const statusBreakdown = loansByStatus.reduce((acc: any, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const approvalRate = totalApplications > 0 ? (approvedCount / totalApplications) * 100 : 0;
    const defaultRate = approvedCount > 0 ? (defaultedCount / approvedCount) * 100 : 0;

    return {
      totalLoans,
      loansByStatus: statusBreakdown,
      averageLoanAmount: Number(averageAmount._avg.amount || 0),
      approvalRate: Number(approvalRate.toFixed(2)),
      defaultRate: Number(defaultRate.toFixed(2)),
      totalApplications,
      approvedLoans: approvedCount,
      rejectedLoans: rejectedCount,
      defaultedLoans: defaultedCount,
    };
  }

  async getDriverAnalytics() {
    const [
      totalDrivers,
      driversByKYCStatus,
      averageCreditScore,
      scoreDistribution,
      activeDrivers,
      suspendedDrivers,
    ] = await Promise.all([
      db.user.count(),
      db.user.groupBy({
        by: ['kycStatus'],
        _count: true,
      }),
      db.user.aggregate({
        _avg: { creditScore: true },
      }),
      db.user.groupBy({
        by: ['creditRating'],
        _count: true,
      }),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { status: 'SUSPENDED' } }),
    ]);

    const kycBreakdown = driversByKYCStatus.reduce((acc: any, item: any) => {
      acc[item.kycStatus] = item._count;
      return acc;
    }, {});

    const creditScoreDistribution = scoreDistribution.reduce((acc: any, item: any) => {
      acc[item.creditRating || 'UNRATED'] = item._count;
      return acc;
    }, {});

    return {
      totalDrivers,
      activeDrivers,
      suspendedDrivers,
      kycStatusBreakdown: kycBreakdown,
      averageCreditScore: Number(averageCreditScore._avg.creditScore || 0),
      creditScoreDistribution,
    };
  }

  async getPaymentAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalPayments,
      paymentsByMethod,
      paymentsByStatus,
      totalAmount,
      successfulAmount,
      avgPaymentAmount,
    ] = await Promise.all([
      db.payment.count({ where }),
      db.payment.groupBy({
        by: ['method'],
        where,
        _count: true,
        _sum: { amount: true },
      }),
      db.payment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      db.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _avg: { amount: true },
      }),
    ]);

    const methodBreakdown = paymentsByMethod.reduce((acc: any, item: any) => {
      acc[item.method] = {
        count: item._count,
        totalAmount: Number(item._sum.amount || 0),
      };
      return acc;
    }, {});

    const statusBreakdown = paymentsByStatus.reduce((acc: any, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const successCount = statusBreakdown.SUCCESS || 0;
    const successRate = totalPayments > 0 ? (successCount / totalPayments) * 100 : 0;

    return {
      totalPayments,
      paymentsByMethod: methodBreakdown,
      paymentsByStatus: statusBreakdown,
      totalAmount: Number(totalAmount._sum.amount || 0),
      successfulAmount: Number(successfulAmount._sum.amount || 0),
      averagePaymentAmount: Number(avgPaymentAmount._avg.amount || 0),
      successRate: Number(successRate.toFixed(2)),
    };
  }

  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly', startDate?: Date, endDate?: Date) {
    const where: any = { status: 'SUCCESS' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const payments = await db.payment.findMany({
      where,
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const revenueData: { [key: string]: number } = {};

    payments.forEach((payment: any) => {
      let key: string;
      const date = new Date(payment.createdAt);

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      revenueData[key] = (revenueData[key] || 0) + Number(payment.amount);
    });

    const timeSeries = Object.entries(revenueData).map(([date, amount]) => ({
      date,
      amount: Number(amount.toFixed(2)),
    }));

    return { period, timeSeries };
  }

  async getDashboardStats() {
    const [
      financial,
      loanStats,
      driverStats,
      recentPayments,
      recentLoans,
      overdueSchedules,
    ] = await Promise.all([
      this.getFinancialSummary(),
      this.getLoanAnalytics(),
      this.getDriverAnalytics(),
      db.payment.findMany({
        where: { status: 'SUCCESS' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          loan: { select: { id: true, amount: true } },
        },
      }),
      db.loan.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.loanSchedule.count({
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const activeLoansCount = await db.loan.count({ where: { status: 'ACTIVE' } });
    const pendingLoansCount = await db.loan.count({ where: { status: 'PENDING' } });

    return {
      financial,
      loans: {
        ...loanStats,
        activeLoans: activeLoansCount,
        pendingLoans: pendingLoansCount,
        overduePayments: overdueSchedules,
      },
      drivers: driverStats,
      recentActivity: {
        recentPayments,
        recentLoans,
      },
    };
  }
}

export const reportService = new ReportService();
