'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Car } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Incident {
  id: string;
  type: string;
  driverName: string;
  vehicleName: string;
  plate: string;
  location: string;
  date: string;
  severity: string;
  status: string;
  description: string;
}

const mockIncidents: Incident[] = [
  { id: 'I1', type: 'Accident', driverName: 'Diallo Moussa', vehicleName: 'Toyota Corolla', plate: 'EF-5678-GH', location: 'Yopougon', date: '2024-07-28', severity: 'Grave', status: 'INVESTIGATING', description: 'Collision avec un autre v\u00e9hicule' },
  { id: 'I2', type: 'Panne', driverName: 'Kouam\u00e9 Jean', vehicleName: 'Toyota Hilux', plate: 'AB-1234-CD', location: 'Cocody', date: '2024-07-25', severity: 'Mineur', status: 'RESOLVED', description: 'Probl\u00e8me de batterie' },
  { id: 'I3', type: 'Accident', driverName: 'Yao Koffi', vehicleName: 'Nissan Patrol', plate: 'UV-1234-WX', location: 'Plateau', date: '2024-07-20', severity: 'Mod\u00e9r\u00e9', status: 'REPORTED', description: 'Accrochage mineur sur parking' },
  { id: 'I4', type: 'Vol', driverName: 'Traor\u00e9 Fatou', vehicleName: 'Hyundai Tucson', plate: 'IJ-9012-KL', location: 'Marcory', date: '2024-07-15', severity: 'Grave', status: 'CLOSED', description: 'Tentative de vol d\u00e9jou\u00e9e' },
  { id: 'I5', type: 'Panne', driverName: 'Coulibaly Awa', vehicleName: 'Suzuki Swift', plate: 'MN-3456-OP', location: 'Adjam\u00e9', date: '2024-07-10', severity: 'Mineur', status: 'RESOLVED', description: 'Crevaison' },
];

const severityColors: Record<string, string> = {
  'Grave': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Mod\u00e9r\u00e9': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Mineur': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const columns: ColumnDef<Incident>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">{row.original.type}</span>
      </div>
    ),
  },
  {
    accessorKey: 'driverName',
    header: 'Conducteur',
  },
  {
    accessorKey: 'vehicleName',
    header: 'V\u00e9hicule',
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.vehicleName}</p>
        <p className="text-xs text-muted-foreground font-mono">{row.original.plate}</p>
      </div>
    ),
  },
  {
    accessorKey: 'location',
    header: 'Lieu',
  },
  {
    accessorKey: 'severity',
    header: 'Gravit\u00e9',
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          severityColors[row.original.severity] || ''
        }`}
      >
        {row.original.severity}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function IncidentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredIncidents =
    statusFilter === 'all'
      ? mockIncidents
      : mockIncidents.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents"
        description="Rapports d'accidents et incidents de la flotte"
      />

      <DataTable
        columns={columns}
        data={filteredIncidents}
        searchKey="driverName"
        searchPlaceholder="Rechercher un incident..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="REPORTED">Signal\u00e9</SelectItem>
              <SelectItem value="INVESTIGATING">En cours</SelectItem>
              <SelectItem value="RESOLVED">R\u00e9solu</SelectItem>
              <SelectItem value="CLOSED">Cl\u00f4tur\u00e9</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
