import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class GamificationService {
  async getBadgeDefinitions() {
    return db.badgeDefinition.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });
  }

  async getDriverBadges(driverId: string) {
    return db.driverBadge.findMany({
      where: { userId: driverId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async awardBadge(userId: string, badgeId: string, metadata?: Record<string, unknown>) {
    const badge = await db.badgeDefinition.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundError('Badge introuvable');

    const existing = await db.driverBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) throw new ConflictError('Ce badge a déjà été attribué à ce conducteur');

    const awarded = await db.driverBadge.create({
      data: {
        userId,
        badgeId,
        metadata: metadata as Prisma.InputJsonValue,
      },
      include: { badge: true },
    });

    // Send notification
    await db.notification.create({
      data: {
        userId,
        type: 'BADGE_EARNED',
        title: 'Nouveau badge obtenu !',
        body: `Félicitations ! Vous avez obtenu le badge "${badge.name}"`,
        data: { badgeId: badge.id, badgeName: badge.name } as Prisma.InputJsonValue,
      },
    });

    return awarded;
  }

  async getLeaderboard(params: { page: number; limit: number; period: string }) {
    const dateFilter: Prisma.DriverBadgeWhereInput = {};
    if (params.period !== 'all') {
      const since = new Date();
      if (params.period === 'week') since.setDate(since.getDate() - 7);
      if (params.period === 'month') since.setMonth(since.getMonth() - 1);
      dateFilter.earnedAt = { gte: since };
    }

    // Get badge counts per user
    const badgeCounts = await db.driverBadge.groupBy({
      by: ['userId'],
      where: dateFilter,
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const totalDrivers = await db.driverBadge.groupBy({
      by: ['userId'],
      where: dateFilter,
      _count: true,
    });

    const leaderboard = await Promise.all(
      badgeCounts.map(async (entry, index) => {
        const user = await db.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, firstName: true, lastName: true, profilePhoto: true },
        });
        return {
          rank: (params.page - 1) * params.limit + index + 1,
          driver: user,
          badgeCount: entry._count,
        };
      }),
    );

    return { leaderboard, total: totalDrivers.length };
  }

  async getDriverRanking(driverId: string) {
    const badgeCount = await db.driverBadge.count({ where: { userId: driverId } });
    const badges = await db.driverBadge.findMany({
      where: { userId: driverId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Count how many drivers have more badges
    const driversAbove = await db.driverBadge.groupBy({
      by: ['userId'],
      _count: true,
      having: { userId: { _count: { gt: badgeCount } } },
    });

    return {
      rank: driversAbove.length + 1,
      badgeCount,
      badges,
    };
  }
}

export const gamificationService = new GamificationService();
