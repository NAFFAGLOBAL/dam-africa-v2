import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { formatPhone } from '../../utils/auth';
import { Prisma } from '@prisma/client';

const userSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  address: true,
  city: true,
  profilePhoto: true,
  licenseNumber: true,
  status: true,
  isVerified: true,
  lastLoginAt: true,
  customerId: true,
  createdAt: true,
  updatedAt: true,
};

export class UsersService {
  async listUsers(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    customerId?: string;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (params.status) where.status = params.status as Prisma.EnumUserStatusFilter['equals'];
    if (params.customerId) where.customerId = params.customerId;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: userSelect,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ]);

    return { users, total };
  }

  async getUserById(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        kycDocuments: { select: { id: true, type: true, status: true, createdAt: true } },
        _count: { select: { loans: true, payments: true, rentals: true, contracts: true } },
      },
    });
    if (!user) throw new NotFoundError('Utilisateur introuvable');
    return user;
  }

  async updateProfile(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    dateOfBirth?: string;
    licenseNumber?: string;
    profilePhoto?: string;
  }) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    if (data.phone) {
      const formatted = formatPhone(data.phone);
      const existing = await db.user.findFirst({
        where: { phone: formatted, NOT: { id } },
      });
      if (existing) throw new ConflictError('Ce numéro de téléphone est déjà utilisé');
      data.phone = formatted;
    }

    const updateData: Prisma.UserUpdateInput = { ...data };
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);

    return db.user.update({ where: { id }, data: updateData, select: userSelect });
  }

  async suspendUser(id: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    return db.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
      select: userSelect,
    });
  }

  async activateUser(id: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    return db.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: userSelect,
    });
  }

  async deleteUser(id: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    await db.user.delete({ where: { id } });
  }
}

export const usersService = new UsersService();
