import { db } from '../../utils/database';
import { Prisma } from '@prisma/client';

interface DateRange {
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

function getDateFilter(range: DateRange): { gte?: Date; lte?: Date } {
  const filter: { gte?: Date; lte?: Date } = {};
  if (range.startDate) filter.gte = new Date(range.startDate);
  if (range.endDate) filter.lte = new Date(range.endDate);
  return filter;
}

export class ReportsService {
  async getRevenueReport(params: DateRange) {
    const dateFilter = getDateFilter(params);
    const where: Prisma.PaymentWhereInput = { status: 'COMPLETED' };
    if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
    if (params.customerId) where.user = { customerId: params.customerId };

    const [totalRevenue, paymentsByMethod, monthlyRevenue] = await Promise.all([
      db.payment.aggregate({ where, _sum: { amount: true }, _count: true }),
      db.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true }),
      db.payment.findMany({
        where,
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group monthly revenue
    const monthlyMap = new Map<string, number>();
    for (const p of monthlyRevenue) {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amount);
    }

    return {
      total: totalRevenue._sum.amount ?? 0,
      count: totalRevenue._count,
      byMethod: paymentsByMethod.map((m) => ({
        method: m.method,
        total: m._sum.amount ?? 0,
        count: m._count,
      })),
      monthly: Array.from(monthlyMap.entries()).map(([month, total]) => ({ month, total })),
    };
  }

  async getPaymentReport(params: DateRange) {
    const dateFilter = getDateFilter(params);
    const where: Prisma.PaymentWhereInput = {};
    if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;

    const [byStatus, byMethod, recentPayments] = await Promise.all([
      db.payment.groupBy({ by: ['status'], where, _sum: { amount: true }, _count: true }),
      db.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true }),
      db.payment.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return { byStatus, byMethod, recentPayments };
  }

  async getDriverReport(params: DateRange) {
    const dateFilter = getDateFilter(params);
    const userWhere: Prisma.UserWhereInput = {};
    if (Object.keys(dateFilter).length > 0) userWhere.createdAt = dateFilter;
    if (params.customerId) userWhere.customerId = params.customerId;

    const [totalDrivers, byStatus, newDrivers, kycStats] = await Promise.all([
      db.user.count({ where: userWhere }),
      db.user.groupBy({ by: ['status'], where: userWhere, _count: true }),
      db.user.count({ where: { ...userWhere, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      db.kYCDocument.groupBy({ by: ['status'], _count: true }),
    ]);

    return { totalDrivers, byStatus, newDriversLast30Days: newDrivers, kycStats };
  }

  async getFleetReport(params: DateRange) {
    const [byStatus, maintenanceCosts, topVehicles] = await Promise.all([
      db.vehicle.groupBy({ by: ['status'], _count: true }),
      db.maintenanceRecord.aggregate({ _sum: { cost: true }, _count: true }),
      db.vehicle.findMany({
        include: { _count: { select: { rentals: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      byStatus,
      maintenance: {
        totalCost: maintenanceCosts._sum.cost ?? 0,
        recordCount: maintenanceCosts._count,
      },
      topVehicles: topVehicles.map((v) => ({
        id: v.id,
        registrationNo: v.registrationNo,
        make: v.make,
        model: v.model,
        rentalCount: v._count.rentals,
      })),
    };
  }

  async getLoanReport(params: DateRange) {
    const dateFilter = getDateFilter(params);
    const where: Prisma.LoanWhereInput = {};
    if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;

    const [byStatus, totalDisbursed, totalRepaid, avgLoanAmount] = await Promise.all([
      db.loan.groupBy({ by: ['status'], where, _sum: { amount: true }, _count: true }),
      db.loan.aggregate({ where: { ...where, status: { in: ['DISBURSED', 'ACTIVE', 'COMPLETED'] } }, _sum: { amount: true } }),
      db.loan.aggregate({ where, _sum: { paidAmount: true } }),
      db.loan.aggregate({ where, _avg: { amount: true } }),
    ]);

    return {
      byStatus,
      totalDisbursed: totalDisbursed._sum.amount ?? 0,
      totalRepaid: totalRepaid._sum.paidAmount ?? 0,
      avgLoanAmount: Math.round(avgLoanAmount._avg.amount ?? 0),
    };
  }

  async exportReport(type: string, params: DateRange) {
    switch (type) {
      case 'revenue':
        return this.getRevenueReport(params);
      case 'payments':
        return this.getPaymentReport(params);
      case 'drivers':
        return this.getDriverReport(params);
      case 'fleet':
        return this.getFleetReport(params);
      case 'loans':
        return this.getLoanReport(params);
      default:
        return null;
    }
  }
}

export const reportsService = new ReportsService();
