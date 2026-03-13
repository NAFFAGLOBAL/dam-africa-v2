'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileCheck, Eye } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

interface KYCSubmission {
  id: string;
  driverName: string;
  documentType: string;
  submittedAt: string;
  status: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const mockKYC: KYCSubmission[] = [
  { id: '1', driverName: 'Ouattara Seydou', documentType: 'Carte d\'identit\u00e9', submittedAt: '2024-07-20', status: 'PENDING' },
  { id: '2', driverName: 'Kone Aminata', documentType: 'Permis de conduire', submittedAt: '2024-07-19', status: 'PENDING' },
  { id: '3', driverName: 'Diarra Mamadou', documentType: 'Justificatif de domicile', submittedAt: '2024-07-18', status: 'PENDING' },
  { id: '4', driverName: 'Kouam\u00e9 Jean', documentType: 'Carte d\'identit\u00e9', submittedAt: '2024-06-15', status: 'APPROVED', reviewedAt: '2024-06-16', reviewedBy: 'Admin' },
  { id: '5', driverName: 'Traor\u00e9 Fatou', documentType: 'Permis de conduire', submittedAt: '2024-06-10', status: 'APPROVED', reviewedAt: '2024-06-11', reviewedBy: 'Admin' },
  { id: '6', driverName: 'Bamba Ibrahim', documentType: 'Photo d\'identit\u00e9', submittedAt: '2024-06-08', status: 'REJECTED', reviewedAt: '2024-06-09', reviewedBy: 'Admin' },
  { id: '7', driverName: 'N\'Guessan Paul', documentType: 'Carte d\'identit\u00e9', submittedAt: '2024-07-21', status: 'PENDING' },
  { id: '8', driverName: 'Soro Lacina', documentType: 'Permis de conduire', submittedAt: '2024-07-17', status: 'EXPIRED' },
];

const columns: ColumnDef<KYCSubmission>[] = [
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
    accessorKey: 'documentType',
    header: 'Type de document',
  },
  {
    accessorKey: 'submittedAt',
    header: 'Soumis le',
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.submittedAt)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm">
        <Eye className="mr-2 h-4 w-4" />
        Examiner
      </Button>
    ),
  },
];

export default function KYCPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredKYC =
    statusFilter === 'all' ? mockKYC : mockKYC.filter((k) => k.status === statusFilter);

  const pendingCount = mockKYC.filter((k) => k.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="V\u00e9rification KYC"
        description={`${pendingCount} document(s) en attente de v\u00e9rification`}
      />

      <DataTable
        columns={columns}
        data={filteredKYC}
        searchKey="driverName"
        searchPlaceholder="Rechercher un conducteur..."
        onRowClick={(kyc) => router.push(`/kyc/${kyc.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuv\u00e9</SelectItem>
              <SelectItem value="REJECTED">Rejet\u00e9</SelectItem>
              <SelectItem value="EXPIRED">Expir\u00e9</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
