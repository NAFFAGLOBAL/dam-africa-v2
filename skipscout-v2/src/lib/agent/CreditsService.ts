import { prisma } from '@/lib/db/prisma';

export class CreditsService {
  constructor(private userId: string) {}

  async getBalance() {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      select: { credits: true },
    });
    return { credits: user?.credits ?? 0 };
  }

  async deduct(amount: number, description: string) {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
    });

    if (!user || user.credits < amount) {
      throw new Error(
        `Insufficient credits. Need ${amount}, have ${user?.credits ?? 0}. Visit /credits to purchase more.`
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: this.userId },
        data: { credits: { decrement: amount } },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: this.userId,
          amount: -amount,
          type: 'search',
          description,
        },
      }),
    ]);

    return {
      success: true,
      creditsDeducted: amount,
      newBalance: user.credits - amount,
    };
  }

  async addCredits(amount: number, description: string, stripeId?: string) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: this.userId },
        data: { credits: { increment: amount } },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: this.userId,
          amount,
          type: 'purchase',
          description,
          stripeId,
        },
      }),
    ]);

    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      select: { credits: true },
    });

    return { success: true, creditsAdded: amount, newBalance: user?.credits ?? 0 };
  }

  async getActivity(limit: number) {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return { activity: transactions };
  }
}
