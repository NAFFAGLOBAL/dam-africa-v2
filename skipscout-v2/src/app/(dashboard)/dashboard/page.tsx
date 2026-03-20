import { prisma } from '@/lib/db/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { StatCards } from '@/components/dashboard/StatCards';
import { RecentSearches } from '@/components/dashboard/RecentSearches';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const [searchCount, creditUsed, listCount, recentSearches] =
    await Promise.all([
      prisma.search.count({ where: { userId: user.id } }),
      prisma.creditTransaction.aggregate({
        where: { userId: user.id, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.listJob.count({ where: { userId: user.id } }),
      prisma.search.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

  const stats = {
    totalSearches: searchCount,
    creditsUsed: Math.abs(creditUsed._sum.amount || 0),
    creditsRemaining: user.credits,
    listsBuilt: listCount,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Welcome back{user.name ? `, ${user.name}` : ''}
          </p>
        </div>
        <Link href="/copilot">
          <Button className="gap-2">
            <Bot className="h-4 w-4" />
            Open AI Copilot
          </Button>
        </Link>
      </div>

      <StatCards stats={stats} />

      <RecentSearches
        searches={recentSearches.map((s) => ({
          ...s,
          query: s.query as Record<string, unknown>,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
