import { prisma } from '@/lib/db/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditPackages } from './CreditPackages';

export default async function CreditsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const packages = await prisma.creditPackage.findMany({
    where: { active: true },
    orderBy: { credits: 'asc' },
  });

  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Credits</h1>
        <p className="text-sm text-slate-500">
          Your current balance: <strong>{user.credits.toLocaleString()} credits</strong>
        </p>
      </div>

      <CreditPackages
        packages={packages.map((p) => ({
          id: p.id,
          name: p.name,
          credits: p.credits,
          price: p.price,
        }))}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={
                      t.amount > 0 ? 'font-medium text-green-600' : 'font-medium text-red-600'
                    }
                  >
                    {t.amount > 0 ? '+' : ''}
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
