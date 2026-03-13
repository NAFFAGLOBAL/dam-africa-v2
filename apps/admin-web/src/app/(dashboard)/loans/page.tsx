'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { getInitials, formatCurrency, formatDate } from '@/lib/utils';

interface Loan {
  id: string;
  driverName: string;
  amount: number;
  remainingBalance: number;
  interestRate: number;
  term: number;
  status: string;
  appliedAt: string;
  disbursedAt?: string;
}

const mockLoans: Loan[] = [
  { id: 'L1', driverName: 'Kouam\u00e9 Jean', amount: 2500000, remainingBalance: 1800000, interestRate: 8.5, term: 12, status: 'ACTIVE', appliedAt: '2024-05-20', disbursedAt: '2024-06-01' },
  { id: 'L2', driverName: 'Traor\u00e9 Fatou', amount: 3500000, remainingBalance: 3500000, interestRate: 9.0, term: 18, status: 'APPROVED', appliedAt: '2024-07-10' },
  { id: 'L3', driverName: 'Diallo Moussa', amount: 1500000, remainingBalance: 0, interestRate: 7.5, term: 6, status: 'COMPLETED', appliedAt: '2024-01-05', disbursedAt: '2024-01-15' },
  { id: 'L4', driverName: 'Kone Aminata', amount: 2000000, remainingBalance: 2000000, interestRate: 8.0, term: 12, status: 'PENDING', appliedAt: '2024-07-18' },
  { id: 'L5', driverName: 'Yao Koffi', amount: 5000000, remainingBalance: 4200000, interestRate: 9.5, term: 24, status: 'ACTIVE', appliedAt: '2024-03-01', disbursedAt: '2024-03-15' },
  { id: 'L6', driverName: 'Bamba Ibrahim', amount: 1000000, remainingBalance: 1000000, interestRate: 10.0, term: 6, status: 'REJECTED', appliedAt: '2024-07-05' },
  { id: 'L7', driverName: 'Coulibaly Awa', amount: 1800000, remainingBalance: 900000, interestRate: 8.0, term: 12, status: 'ACTIVE', appliedAt: '2024-02-20', disbursedAt: '2024-03-01' },
  { id: 'L8', driverName: 'Tour\u00e9 Abdoulaye', amount: 4000000, remainingBalance: 3200000, interestRate: 8.5, term: 18, status: 'DEFAULTED', appliedAt: '2023-12-01', disbursedAt: '2023-12-15' },
];

const statusCounts = {
  PENDING: mockLoans.filter((l) => l.status === 'PENDING').length,
  APPROVED: mockLoans.filter((l) => l.status === 'APPROVED').length,
  ACTIVE: mockLoans.filter((l) => l.status === 'ACTIVE').length,
  COMPLETED: mockLoans.filter((l) => l.status === 'COMPLETED').length,
};

const pipelineSteps = [
  { label: 'En attente', count: statusCounts.PENDING, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { label: 'Approuv\u00e9', count: statusCounts.APPROVED, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Actif', count: statusCounts.ACTIVE, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { label: 'Termin\u00e9', count: statusCounts.COMPLETED, icon: CheckCircle2, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30' },
];

const columns: ColumnDef<Loan>[] = [
  {
    accessorKey: 'driverName',
    header: 'Conducteur',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(row.original.driverName)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{row.original.driverName}</span>
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Montant',
    cell: ({ row }) => (
      <span className="font-semibold text-sm tabular-nums">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: 'remainingBalance',
    header: 'Solde restant',
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatCurrency(row.original.remainingBalance)}
      </span>
    ),
  },
  {
    accessorKey: 'interestRate',
    header: 'Taux',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.interestRate}%</span>
    ),
  },
  {
    accessorKey: 'term',
    header: 'Dur\u00e9e',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.term} mois</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'appliedAt',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.appliedAt)}
      </span>
    ),
  },
];

export default function LoansPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLoans =
    statusFilter === 'all' ? mockLoans : mockLoans.filter((l) => l.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pr\u00eats"
        description="G\u00e9rer les demandes et pr\u00eats actifs"
      />

      {/* Pipeline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelineSteps.map((step) => (
          <Card key={step.label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${step.bg} flex items-center justify-center`}>
                <step.icon className={`h-5 w-5 ${step.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{step.count}</p>
                <p className="text-xs text-muted-foreground">{step.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredLoans}
        searchKey="driverName"
        searchPlaceholder="Rechercher un pr\u00eat..."
        onRowClick={(loan) => router.push(`/loans/${loan.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuv\u00e9</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="COMPLETED">Termin\u00e9</SelectItem>
              <SelectItem value="REJECTED">Rejet\u00e9</SelectItem>
              <SelectItem value="DEFAULTED">En d\u00e9faut</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
