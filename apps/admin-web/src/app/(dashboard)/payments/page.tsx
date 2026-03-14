'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { getInitials, formatCurrency, formatCurrencyShort, formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  driverName: string;
  amount: number;
  method: string;
  loanId: string;
  status: string;
  date: string;
  reference: string;
}

const mockPayments: Payment[] = [
  { id: 'P1', driverName: 'Kouamé Jean', amount: 225000, method: 'Wave', loanId: 'L1', status: 'COMPLETED', date: '2024-08-01', reference: 'WAV-78542' },
  { id: 'P2', driverName: 'Yao Koffi', amount: 280000, method: 'Orange Money', loanId: 'L5', status: 'COMPLETED', date: '2024-08-01', reference: 'OMO-45612' },
  { id: 'P3', driverName: 'Coulibaly Awa', amount: 175000, method: 'MTN MoMo', loanId: 'L7', status: 'PENDING', date: '2024-08-02', reference: 'MTN-12345' },
  { id: 'P4', driverName: 'Traoré Fatou', amount: 250000, method: 'Wave', loanId: 'L2', status: 'COMPLETED', date: '2024-07-30', reference: 'WAV-98765' },
  { id: 'P5', driverName: 'Touré Abdoulaye', amount: 300000, method: 'Espèces', loanId: 'L8', status: 'FAILED', date: '2024-07-28', reference: 'CSH-00123' },
  { id: 'P6', driverName: 'Cissé Mariam', amount: 200000, method: 'Wave', loanId: 'L3', status: 'COMPLETED', date: '2024-07-25', reference: 'WAV-33456' },
  { id: 'P7', driverName: 'Diallo Moussa', amount: 150000, method: 'Orange Money', loanId: 'L4', status: 'COMPLETED', date: '2024-07-20', reference: 'OMO-78901' },
  { id: 'P8', driverName: 'Kouamé Jean', amount: 225000, method: 'Wave', loanId: 'L1', status: 'REFUNDED', date: '2024-07-15', reference: 'WAV-55678' },
];

const summaryCards = [
  { label: 'Total reçu ce mois', value: 12_750_000, change: 18.5, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { label: 'Transactions réussies', value: 156, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { label: 'En attente', value: 8, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { label: 'Échouées', value: 3, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
];

const columns: ColumnDef<Payment>[] = [
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
    accessorKey: 'method',
    header: 'Méthode',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.method}</span>
    ),
  },
  {
    accessorKey: 'reference',
    header: 'Référence',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.reference}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.date)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredPayments = mockPayments.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Suivi des paiements et transactions"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums">
                  {typeof card.value === 'number' && card.value > 10000
                    ? formatCurrencyShort(card.value)
                    : card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        searchKey="driverName"
        searchPlaceholder="Rechercher un paiement..."
        toolbar={
          <div className="flex gap-2">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="Wave">Wave</SelectItem>
                <SelectItem value="Orange Money">Orange Money</SelectItem>
                <SelectItem value="MTN MoMo">MTN MoMo</SelectItem>
                <SelectItem value="Espèces">Espèces</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="COMPLETED">Effectué</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
                <SelectItem value="REFUNDED">Remboursé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
