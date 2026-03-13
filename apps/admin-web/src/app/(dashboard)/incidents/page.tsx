'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { incidentsApi } from '@/lib/api';

interface Incident {
  id: string;
  severity: string;
  status: string;
  driverFault: string;
  locationDescription: string | null;
  description: string;
  occurredAt: string;
  thirdPartyInvolved: boolean;
  user: { id: string; firstName: string; lastName: string };
  vehicle: { id: string; licensePlate: string; make: string; model: string };
  _count: { media: number; notes: number };
}

const severityLabels: Record<string, string> = {
  MINOR: 'Faible',
  MODERATE: 'Moyen-grave',
  SEVERE: 'Grave',
  TOTAL_LOSS: 'Extrêmement grave',
};

const severityColors: Record<string, string> = {
  MINOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  MODERATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  SEVERE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  TOTAL_LOSS: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const faultLabels: Record<string, string> = {
  NOT_DETERMINED: 'Non déterminé',
  DRIVER_AT_FAULT: 'En tort',
  DRIVER_NOT_AT_FAULT: 'Non responsable',
};

export default function IncidentsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      const res = await incidentsApi.list(params);
      setIncidents(res.data.data || []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter, page]);

  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: 'severity',
      header: 'Gravité',
      cell: ({ row }) => {
        const s = row.original.severity;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              severityColors[s] || ''
            }`}
          >
            {severityLabels[s] || s}
          </span>
        );
      },
    },
    {
      id: 'driver',
      header: 'Conducteur',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.user.firstName} {row.original.user.lastName}
        </span>
      ),
    },
    {
      id: 'vehicle',
      header: 'Véhicule',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.vehicle.make} {row.original.vehicle.model}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.original.vehicle.licensePlate}</p>
        </div>
      ),
    },
    {
      accessorKey: 'locationDescription',
      header: 'Lieu',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.locationDescription || '—'}</span>
      ),
    },
    {
      accessorKey: 'driverFault',
      header: 'Responsabilité',
      cell: ({ row }) => (
        <span className="text-sm">{faultLabels[row.original.driverFault] || row.original.driverFault}</span>
      ),
    },
    {
      accessorKey: 'occurredAt',
      header: 'Date',
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.occurredAt)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/incidents/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinistralité"
        description="Rapports d'accidents et gestion des dossiers"
      />

      {loading && incidents.length === 0 ? (
        <LoadingState type="table" />
      ) : (
        <DataTable
          columns={columns}
          data={incidents}
          searchKey="locationDescription"
          searchPlaceholder="Rechercher par lieu..."
          toolbar={
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="REPORTED">Signalé</SelectItem>
                  <SelectItem value="INVESTIGATING">En cours</SelectItem>
                  <SelectItem value="RESOLVED">Résolu</SelectItem>
                  <SelectItem value="CLOSED">Clôturé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Gravité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes gravités</SelectItem>
                  <SelectItem value="MINOR">Faible</SelectItem>
                  <SelectItem value="MODERATE">Moyen-grave</SelectItem>
                  <SelectItem value="SEVERE">Grave</SelectItem>
                  <SelectItem value="TOTAL_LOSS">Extrêmement grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}
    </div>
  );
}
