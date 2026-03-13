'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Car, Calendar, Wallet, User, FileText } from 'lucide-react';
import { getInitials, formatCurrency, formatDate } from '@/lib/utils';

const mockContract = {
  id: 'C1',
  driverName: 'Kouam\u00e9 Jean',
  driverEmail: 'kouame@email.com',
  vehicleName: 'Toyota Hilux 2023',
  plate: 'AB-1234-CD',
  totalValue: 18500000,
  downPayment: 3700000,
  monthlyPayment: 520000,
  remainingMonths: 30,
  totalMonths: 36,
  totalPaid: 6820000,
  status: 'ACTIVE',
  startDate: '2024-01-15',
  endDate: '2027-01-15',
  payments: [
    { month: 'Ao\u00fbt 2024', amount: 520000, status: 'PENDING', date: '2024-08-15' },
    { month: 'Juillet 2024', amount: 520000, status: 'COMPLETED', date: '2024-07-15' },
    { month: 'Juin 2024', amount: 520000, status: 'COMPLETED', date: '2024-06-15' },
    { month: 'Mai 2024', amount: 520000, status: 'COMPLETED', date: '2024-05-15' },
  ],
};

export default function ContractDetailPage() {
  const params = useParams();
  const contract = mockContract;
  const progressPct = Math.round(
    ((contract.totalMonths - contract.remainingMonths) / contract.totalMonths) * 100
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Contrat ${contract.id}`}
        breadcrumbs={[
          { label: 'Contrats', href: '/contracts' },
          { label: contract.id },
        ]}
        actions={
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            T\u00e9l\u00e9charger le contrat
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">D\u00e9tails du contrat</CardTitle>
              <StatusBadge status={contract.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(contract.driverName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{contract.driverName}</p>
                <p className="text-xs text-muted-foreground">{contract.driverEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">{contract.vehicleName}</p>
                <p className="text-xs text-muted-foreground font-mono">{contract.plate}</p>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-1">Valeur totale du contrat</p>
              <p className="text-stat-lg">{formatCurrency(contract.totalValue)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-semibold">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pay\u00e9: {formatCurrency(contract.totalPaid)}</span>
                <span>Restant: {formatCurrency(contract.totalValue - contract.totalPaid)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Apport initial', value: formatCurrency(contract.downPayment), icon: Wallet },
                { label: 'Mensualit\u00e9', value: formatCurrency(contract.monthlyPayment), icon: Calendar },
                { label: 'D\u00e9but', value: formatDate(contract.startDate), icon: Calendar },
                { label: 'Fin pr\u00e9vue', value: formatDate(contract.endDate), icon: Calendar },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des versements</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {contract.payments.map((p, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.month}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(p.amount)}
                  </span>
                  <StatusBadge status={p.status} showDot={false} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
