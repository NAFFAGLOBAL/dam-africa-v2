import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class IncomeService {
  async recordIncome(userId: string, data: {
    source: string;
    amount: number;
    date: string;
    trips?: number;
    hours?: number;
    reference?: string;
    metadata?: Record<string, unknown>;
  }) {
    return db.incomeRecord.create({
      data: {
        userId,
        source: data.source as Prisma.EnumIncomeSourceFilter['equals'],
        amount: data.amount,
        currency: 'XOF',
        date: new Date(data.date),
        trips: data.trips,
        hours: data.hours,
        reference: data.reference,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async getIncomeHistory(params: {
    page: number;
    limit: number;
    userId?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
    isVerified?: boolean;
  }) {
    const where: Prisma.IncomeRecordWhereInput = {};
    if (params.userId) where.userId = params.userId;
    if (params.source) where.source = params.source as Prisma.EnumIncomeSourceFilter['equals'];
    if (params.isVerified !== undefined) where.isVerified = params.isVerified;
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = new Date(params.startDate);
      if (params.endDate) where.date.lte = new Date(params.endDate);
    }

    const [records, total] = await Promise.all([
      db.incomeRecord.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { date: 'desc' },
      }),
      db.incomeRecord.count({ where }),
    ]);

    return { records, total };
  }

  async verifyIncome(id: string, verifiedBy: string) {
    const record = await db.incomeRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundError('Enregistrement de revenu introuvable');

    return db.incomeRecord.update({
      where: { id },
      data: { isVerified: true, verifiedBy, verifiedAt: new Date() },
    });
  }

  async getIncomeStats(userId: string) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const [thisMonthIncome, lastMonthIncome, threeMonthIncome, bySource] = await Promise.all([
      db.incomeRecord.aggregate({
        where: { userId, date: { gte: thisMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      db.incomeRecord.aggregate({
        where: { userId, date: { gte: lastMonth, lt: thisMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      db.incomeRecord.aggregate({
        where: { userId, date: { gte: threeMonthsAgo } },
        _sum: { amount: true },
        _count: true,
      }),
      db.incomeRecord.groupBy({
        by: ['source'],
        where: { userId, date: { gte: threeMonthsAgo } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      thisMonth: { total: thisMonthIncome._sum.amount ?? 0, count: thisMonthIncome._count },
      lastMonth: { total: lastMonthIncome._sum.amount ?? 0, count: lastMonthIncome._count },
      threeMonthAvg: Math.round((threeMonthIncome._sum.amount ?? 0) / 3),
      bySource,
    };
  }

  async bulkImportIncome(records: Array<{
    userId: string;
    source: string;
    amount: number;
    date: string;
    trips?: number;
    hours?: number;
    reference?: string;
  }>) {
    const data = records.map((r) => ({
      userId: r.userId,
      source: r.source as Prisma.EnumIncomeSourceFilter['equals'],
      amount: r.amount,
      currency: 'XOF',
      date: new Date(r.date),
      trips: r.trips,
      hours: r.hours,
      reference: r.reference,
    }));

    const result = await db.incomeRecord.createMany({ data });
    return { imported: result.count };
  }
}

export const incomeService = new IncomeService();
