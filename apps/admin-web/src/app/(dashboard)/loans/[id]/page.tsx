'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, Wallet, Calendar, Percent, Clock } from 'lucide-react';
import { getInitials, formatCurrency, formatDate } from '@/lib/utils';

const mockLoan = {
  id: 'L1',
  driverName: 'Kouam\u00e9 Jean',
  driverEmail: 'kouame@email.com',
  amount: 2500000,
  disbursedAmount: 2500000,
  remainingBalance: 1800000,
  interestRate: 8.5,
  monthlyPayment: 225000,
  term: 12,
  paidInstallments: 3,
  status: 'ACTIVE',
  appliedAt: '2024-05-20',
  approvedAt: '2024-05-25',
  disbursedAt: '2024-06-01',
  nextPaymentDate: '2024-09-01',
  purpose: 'Acquisition v\u00e9hicule',
  payments: [
    { id: 'P1', amount: 225000, date: '2024-08-01', status: 'COMPLETED', method: 'Wave' },
    { id: 'P2', amount: 225000, date: '2024-07-01', status: 'COMPLETED', method: 'Orange Money' },
    { id: 'P3', amount: 225000, date: '2024-06-01', status: 'COMPLETED', method: 'Wave' },
  ],
};

export default function LoanDetailPage() {
  const params = useParams();
  const loan = mockLoan;
  const progressPercent = ((loan.term - (loan.remainingBalance / loan.monthlyPayment)) / loan.term) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pr\u00eat ${loan.id}`}
        breadcrumbs={[
          { label: 'Pr\u00eats', href: '/loans' },
          { label: loan.id },
        ]}
        actions={
          loan.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
              <Button variant="success" size="sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            </div>
          )
        }
      />

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">D\u00e9tails du pr\u00eat</CardTitle>
              <StatusBadge status={loan.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Driver info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(loan.driverName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{loan.driverName}</p>
                <p className="text-xs text-muted-foreground">{loan.driverEmail}</p>
              </div>
            </div>

            {/* Amount display */}
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-1">Montant du pr\u00eat</p>
              <p className="text-stat-lg">{formatCurrency(loan.amount)}</p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression du remboursement</span>
                <span className="font-semibold">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pay\u00e9: {formatCurrency(loan.amount - loan.remainingBalance)}</span>
                <span>Restant: {formatCurrency(loan.remainingBalance)}</span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Mensualit\u00e9', value: formatCurrency(loan.monthlyPayment), icon: Wallet },
                { label: 'Taux d\'int\u00e9r\u00eat', value: `${loan.interestRate}%`, icon: Percent },
                { label: 'Dur\u00e9e', value: `${loan.term} mois`, icon: Clock },
                { label: 'Versements effectu\u00e9s', value: `${loan.paidInstallments}/${loan.term}`, icon: Calendar },
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

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chronologie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Prochain paiement', value: formatDate(loan.nextPaymentDate), color: 'bg-amber-500' },
                { label: 'D\u00e9caiss\u00e9 le', value: formatDate(loan.disbursedAt || ''), color: 'bg-emerald-500' },
                { label: 'Approuv\u00e9 le', value: formatDate(loan.approvedAt), color: 'bg-blue-500' },
                { label: 'Demand\u00e9 le', value: formatDate(loan.appliedAt), color: 'bg-gray-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color} mt-1.5 shrink-0`} />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {loan.payments.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.method} - {formatDate(payment.date)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={payment.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
