import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { hashPassword } from '../../utils/auth';
import { Prisma } from '@prisma/client';

const adminSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  phone: true,
  profilePhoto: true,
  lastLoginAt: true,
  customerId: true,
  createdAt: true,
  updatedAt: true,
};

export class AdminService {
  async getDashboardStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalDrivers,
      activeDrivers,
      pendingKyc,
      totalVehicles,
      availableVehicles,
      activeRentals,
      totalLoans,
      activeLoans,
      pendingLoans,
      thisMonthPayments,
      lastMonthPayments,
      thisMonthRevenue,
      lastMonthRevenue,
      openTickets,
      activeContracts,
      totalAccidents,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.kYCDocument.count({ where: { status: 'PENDING' } }),
      db.vehicle.count(),
      db.vehicle.count({ where: { status: 'AVAILABLE' } }),
      db.rental.count({ where: { status: 'ACTIVE' } }),
      db.loan.count(),
      db.loan.count({ where: { status: { in: ['ACTIVE', 'DISBURSED'] } } }),
      db.loan.count({ where: { status: 'PENDING' } }),
      db.payment.count({ where: { createdAt: { gte: thisMonth }, status: 'COMPLETED' } }),
      db.payment.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth }, status: 'COMPLETED' } }),
      db.payment.aggregate({ where: { createdAt: { gte: thisMonth }, status: 'COMPLETED' }, _sum: { amount: true } }),
      db.payment.aggregate({ where: { createdAt: { gte: lastMonth, lt: thisMonth }, status: 'COMPLETED' }, _sum: { amount: true } }),
      db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      db.contract.count({ where: { status: 'ACTIVE' } }),
      db.accidentReport.count({ where: { status: { in: ['REPORTED', 'INVESTIGATING'] } } }),
    ]);

    const thisMonthRevenueTotal = thisMonthRevenue._sum.amount ?? 0;
    const lastMonthRevenueTotal = lastMonthRevenue._sum.amount ?? 0;
    const revenueGrowth = lastMonthRevenueTotal > 0
      ? Math.round(((thisMonthRevenueTotal - lastMonthRevenueTotal) / lastMonthRevenueTotal) * 100)
      : 0;

    return {
      drivers: { total: totalDrivers, active: activeDrivers, pendingKyc },
      fleet: { total: totalVehicles, available: availableVehicles, activeRentals },
      loans: { total: totalLoans, active: activeLoans, pending: pendingLoans },
      payments: {
        thisMonth: { count: thisMonthPayments, revenue: thisMonthRevenueTotal },
        lastMonth: { count: lastMonthPayments, revenue: lastMonthRevenueTotal },
        revenueGrowth,
      },
      support: { openTickets },
      contracts: { active: activeContracts },
      accidents: { open: totalAccidents },
    };
  }

  async getAdminUsers() {
    return db.admin.findMany({
      select: adminSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    customerId?: string;
  }) {
    const existing = await db.admin.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Un administrateur avec cet email existe déjà');

    const passwordHash = await hashPassword(data.password);
    return db.admin.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        phone: data.phone,
        customerId: data.customerId,
      },
      select: adminSelect,
    });
  }

  async updateAdmin(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
    isActive?: boolean;
  }) {
    const admin = await db.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundError('Administrateur introuvable');

    return db.admin.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        phone: data.phone,
        isActive: data.isActive,
      },
      select: adminSelect,
    });
  }

  async getAuditLog(params: {
    page: number;
    limit: number;
    action?: string;
    resource?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.action) where.action = params.action;
    if (params.resource) where.resource = params.resource;
    if (params.adminId) where.adminId = params.adminId;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: { admin: { select: { id: true, firstName: true, lastName: true, email: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getAdminPreferences(adminId: string) {
    const admin = await db.admin.findUnique({
      where: { id: adminId },
      select: { preferences: true },
    });
    if (!admin) throw new NotFoundError('Administrateur introuvable');
    return admin.preferences;
  }

  async updateAdminPreferences(adminId: string, preferences: Record<string, unknown>) {
    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundError('Administrateur introuvable');

    return db.admin.update({
      where: { id: adminId },
      data: { preferences: preferences as Prisma.InputJsonValue },
      select: { preferences: true },
    });
  }

  async logAction(adminId: string, action: string, resource: string, resourceId?: string, details?: unknown, ipAddress?: string, userAgent?: string) {
    return db.auditLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        details: details as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
      },
    });
  }
}

export const adminService = new AdminService();
