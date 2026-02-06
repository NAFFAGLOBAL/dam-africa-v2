import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { UpdateProfileInput, SuspendUserInput } from './user.schemas';

export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        profilePhotoUrl: true,
        status: true,
        kycStatus: true,
        creditScore: true,
        creditRating: true,
        emailVerified: true,
        phoneVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            loans: true,
            payments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
        ...(data.profilePhotoUrl && { profilePhotoUrl: data.profilePhotoUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        profilePhotoUrl: true,
        status: true,
        kycStatus: true,
        creditScore: true,
        creditRating: true,
        updatedAt: true,
      },
    });

    logger.info('Profile updated:', { userId });

    return updatedUser;
  }

  /**
   * List users with filters (Admin)
   */
  async listUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    kycStatus?: string,
    status?: string,
    creditRating?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (kycStatus) where.kycStatus = kycStatus;
    if (status) where.status = status;
    if (creditRating) where.creditRating = creditRating;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          kycStatus: true,
          creditScore: true,
          creditRating: true,
          createdAt: true,
          _count: {
            select: {
              loans: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Suspend user (Admin)
   */
  async suspendUser(userId: string, data: SuspendUserInput) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.status === 'SUSPENDED') {
      throw new ConflictError('User is already suspended');
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
      },
    });

    // Log suspension with reason
    logger.warn('User suspended:', {
      userId,
      reason: data.reason,
    });

    return updatedUser;
  }

  /**
   * Activate user (Admin)
   */
  async activateUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.status === 'ACTIVE') {
      throw new ConflictError('User is already active');
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
    });

    logger.info('User activated:', { userId });

    return updatedUser;
  }

  /**
   * Delete user (soft delete) (Admin)
   */
  async deleteUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if user has active loans
    const activeLoans = await db.loan.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (activeLoans > 0) {
      throw new ConflictError('Cannot delete user with active loans');
    }

    // Soft delete (mark as deleted)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
      },
    });

    logger.warn('User deleted:', { userId });

    return updatedUser;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [user, loans, payments] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          creditScore: true,
          creditRating: true,
          kycStatus: true,
          createdAt: true,
        },
      }),
      db.loan.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          status: true,
          amountPaid: true,
          totalRepayment: true,
        },
      }),
      db.payment.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Calculate statistics
    const totalLoans = loans.length;
    const activeLoans = loans.filter((l) => l.status === 'ACTIVE').length;
    const completedLoans = loans.filter((l) => l.status === 'COMPLETED').length;
    const totalBorrowed = loans.reduce((sum, l) => sum + Number(l.amount), 0);
    const totalRepaid = loans.reduce((sum, l) => sum + Number(l.amountPaid), 0);

    const successfulPayments = payments.filter((p) => p.status === 'SUCCESS').length;
    const totalPayments = payments.length;
    const onTimePaymentRate =
      totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      user: {
        creditScore: user.creditScore,
        creditRating: user.creditRating,
        kycStatus: user.kycStatus,
        accountAgeDays: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      loans: {
        total: totalLoans,
        active: activeLoans,
        completed: completedLoans,
        totalBorrowed,
        totalRepaid,
        outstandingBalance: totalBorrowed - totalRepaid,
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        onTimeRate: Math.round(onTimePaymentRate),
      },
    };
  }
}

export const userService = new UserService();
