import { prisma } from '@/lib/db/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const typeLabels: Record<string, string> = {
  versium_contact_append: 'Skip Trace',
  versium_demographic_append: 'Property Lookup',
  versium_firmographic_append: 'Business Intel',
  versium_b2c_estimate: 'B2C Estimate',
  versium_b2b_estimate: 'B2B Estimate',
  versium_ip_domain: 'IP Lookup',
};

export default async function HistoryPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const searches = await prisma.search.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Search History</h1>
        <p className="text-sm text-slate-500">Your recent skip tracing and data lookups.</p>
      </div>

      {searches.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No searches yet. Try the AI Copilot to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <Card key={search.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {typeLabels[search.type] || search.type}
                  </Badge>
                  <span className="text-sm text-slate-700">
                    {JSON.stringify(search.query).substring(0, 80)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{search.credits} credits</span>
                  <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
