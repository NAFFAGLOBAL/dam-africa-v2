'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getInitials, formatCurrency, formatDate } from '@/lib/utils';

interface Contract {
  id: string;
  driverName: string;
  vehicleName: string;
  totalValue: number;
  monthlyPayment: number;
  remainingMonths: number;
  totalMonths: number;
  status: string;
  startDate: string;
}

const mockContracts: Contract[] = [
  { id: 'C1', driverName: 'Kouamé Jean', vehicleName: 'Toyota Hilux 2023', totalValue: 18500000, monthlyPayment: 520000, remainingMonths: 30, totalMonths: 36, status: 'ACTIVE', startDate: '2024-01-15' },
  { id: 'C2', driverName: 'Yao Koffi', vehicleName: 'Nissan Patrol 2023', totalValue: 25000000, monthlyPayment: 750000, remainingMonths: 44, totalMonths: 48, status: 'ACTIVE', startDate: '2024-03-01' },
  { id: 'C3', driverName: 'Traoré Fatou', vehicleName: 'Hyundai Tucson 2023', totalValue: 15000000, monthlyPayment: 450000, remainingMonths: 0, totalMonths: 36, status: 'COMPLETED', startDate: '2021-06-01' },
  { id: 'C4', driverName: 'Diallo Moussa', vehicleName: 'Toyota Corolla 2022', totalValue: 12000000, monthlyPayment: 380000, remainingMonths: 24, totalMonths: 36, status: 'TERMINATED', startDate: '2023-08-01' },
  { id: 'C5', driverName: 'Kone Aminata', vehicleName: 'Toyota RAV4 2024', totalValue: 22000000, monthlyPayment: 650000, remainingMonths: 36, totalMonths: 36, status: 'PENDING', startDate: '2024-08-01' },
];

const columns: ColumnDef<Contract>[] = [
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
    accessorKey: 'vehicleName',
    header: 'Véhicule',
  },
  {
    accessorKey: 'totalValue',
    header: 'Valeur totale',
    cell: ({ row }) => (
      <span className="font-semibold text-sm tabular-nums">
        {formatCurrency(row.original.totalValue)}
      </span>
    ),
  },
  {
    accessorKey: 'monthlyPayment',
    header: 'Mensualité',
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatCurrency(row.original.monthlyPayment)}</span>
    ),
  },
  {
    id: 'progress',
    header: 'Progression',
    cell: ({ row }) => {
      const { remainingMonths, totalMonths } = row.original;
      const pct = Math.round(((totalMonths - remainingMonths) / totalMonths) * 100);
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function ContractsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContracts =
    statusFilter === 'all' ? mockContracts : mockContracts.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contrats Location-Vente"
        description="Gérer les contrats de location avec option d'achat"
      />

      <DataTable
        columns={columns}
        data={filteredContracts}
        searchKey="driverName"
        searchPlaceholder="Rechercher un contrat..."
        onRowClick={(contract) => router.push(`/contracts/${contract.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="COMPLETED">Terminé</SelectItem>
              <SelectItem value="TERMINATED">Résilié</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
