import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class CustomersService {
  async createCustomer(data: {
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    settings?: Record<string, unknown>;
  }) {
    const existing = await db.customer.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError('Un client avec ce code existe déjà');

    return db.customer.create({
      data: {
        name: data.name,
        code: data.code,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logoUrl: data.logoUrl,
        settings: (data.settings as Prisma.InputJsonValue) ?? {},
      },
    });
  }

  async listCustomers(params: {
    page: number;
    limit: number;
    isActive?: boolean;
    search?: string;
  }) {
    const where: Prisma.CustomerWhereInput = {};
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          _count: { select: { users: true, vehicles: true, admins: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async getCustomer(id: string) {
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, vehicles: true, admins: true, loans: true, contracts: true, rentals: true } },
      },
    });
    if (!customer) throw new NotFoundError('Client introuvable');
    return customer;
  }

  async updateCustomer(id: string, data: Partial<{
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    logoUrl: string;
    settings: Record<string, unknown>;
  }>) {
    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundError('Client introuvable');

    if (data.code && data.code !== customer.code) {
      const existing = await db.customer.findUnique({ where: { code: data.code } });
      if (existing) throw new ConflictError('Ce code est déjà utilisé');
    }

    return db.customer.update({
      where: { id },
      data: {
        ...data,
        settings: data.settings as Prisma.InputJsonValue,
      },
    });
  }

  async suspendCustomer(id: string) {
    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundError('Client introuvable');

    return db.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCustomerStats(id: string) {
    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundError('Client introuvable');

    const [users, vehicles, activeRentals, activeContracts, totalRevenue] = await Promise.all([
      db.user.count({ where: { customerId: id } }),
      db.vehicle.count({ where: { customerId: id } }),
      db.rental.count({ where: { customerId: id, status: 'ACTIVE' } }),
      db.contract.count({ where: { customerId: id, status: 'ACTIVE' } }),
      db.payment.aggregate({
        where: {
          user: { customerId: id },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      users,
      vehicles,
      activeRentals,
      activeContracts,
      totalRevenue: totalRevenue._sum.amount ?? 0,
    };
  }
}

export const customersService = new CustomersService();
