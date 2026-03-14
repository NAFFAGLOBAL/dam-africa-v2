'use client';

import { useState } from 'react';
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

interface Rental {
  id: string;
  driverName: string;
  vehicleName: string;
  plate: string;
  dailyRate: number;
  startDate: string;
  endDate?: string;
  status: string;
  totalPaid: number;
}

const mockRentals: Rental[] = [
  { id: 'R1', driverName: 'Kouamé Jean', vehicleName: 'Toyota Hilux', plate: 'AB-1234-CD', dailyRate: 35000, startDate: '2024-06-01', status: 'ACTIVE', totalPaid: 2100000 },
  { id: 'R2', driverName: 'Traoré Fatou', vehicleName: 'Hyundai Tucson', plate: 'IJ-9012-KL', dailyRate: 30000, startDate: '2024-05-15', status: 'ACTIVE', totalPaid: 2400000 },
  { id: 'R3', driverName: 'Yao Koffi', vehicleName: 'Nissan Patrol', plate: 'UV-1234-WX', dailyRate: 50000, startDate: '2024-07-01', status: 'ACTIVE', totalPaid: 1500000 },
  { id: 'R4', driverName: 'Diallo Moussa', vehicleName: 'Toyota Corolla', plate: 'EF-5678-GH', dailyRate: 25000, startDate: '2024-01-10', endDate: '2024-06-10', status: 'COMPLETED', totalPaid: 3750000 },
  { id: 'R5', driverName: 'Kone Aminata', vehicleName: 'Renault Duster', plate: 'CD-9012-EF', dailyRate: 28000, startDate: '2024-07-15', status: 'PENDING', totalPaid: 0 },
];

const columns: ColumnDef<Rental>[] = [
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
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.vehicleName}</p>
        <p className="text-xs text-muted-foreground font-mono">{row.original.plate}</p>
      </div>
    ),
  },
  {
    accessorKey: 'dailyRate',
    header: 'Tarif/jour',
    cell: ({ row }) => (
      <span className="text-sm font-semibold tabular-nums">
        {formatCurrency(row.original.dailyRate)}
      </span>
    ),
  },
  {
    accessorKey: 'startDate',
    header: 'Début',
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.startDate)}</span>
    ),
  },
  {
    accessorKey: 'totalPaid',
    header: 'Total payé',
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatCurrency(row.original.totalPaid)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function RentalsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRentals =
    statusFilter === 'all' ? mockRentals : mockRentals.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Gérer les locations de véhicules"
      />

      <DataTable
        columns={columns}
        data={filteredRentals}
        searchKey="driverName"
        searchPlaceholder="Rechercher une location..."
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
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
