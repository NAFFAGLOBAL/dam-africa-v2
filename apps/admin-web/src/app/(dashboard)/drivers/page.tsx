'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, MoreHorizontal, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, getInitials, getScoreBgColor, formatPhone } from '@/lib/utils';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  kycStatus: string;
  creditScore: number;
  joinedAt: string;
}

// Mock data
const mockDrivers: Driver[] = [
  { id: '1', firstName: 'Kouamé', lastName: 'Jean', phone: '+2250102030405', email: 'kouame@email.com', status: 'ACTIVE', kycStatus: 'APPROVED', creditScore: 780, joinedAt: '2024-01-15' },
  { id: '2', firstName: 'Traoré', lastName: 'Fatou', phone: '+2250708091011', email: 'traore@email.com', status: 'ACTIVE', kycStatus: 'APPROVED', creditScore: 650, joinedAt: '2024-02-20' },
  { id: '3', firstName: 'Diallo', lastName: 'Moussa', phone: '+2250506070809', email: 'diallo@email.com', status: 'SUSPENDED', kycStatus: 'APPROVED', creditScore: 420, joinedAt: '2024-03-10' },
  { id: '4', firstName: 'Kone', lastName: 'Aminata', phone: '+2250304050607', email: 'kone@email.com', status: 'ACTIVE', kycStatus: 'PENDING', creditScore: 0, joinedAt: '2024-06-05' },
  { id: '5', firstName: 'Yao', lastName: 'Koffi', phone: '+2250203040506', email: 'yao@email.com', status: 'ACTIVE', kycStatus: 'APPROVED', creditScore: 890, joinedAt: '2023-11-20' },
  { id: '6', firstName: 'Bamba', lastName: 'Ibrahim', phone: '+2250405060708', email: 'bamba@email.com', status: 'INACTIVE', kycStatus: 'REJECTED', creditScore: 310, joinedAt: '2024-04-12' },
  { id: '7', firstName: 'Cissé', lastName: 'Mariam', phone: '+2250607080910', email: 'cisse@email.com', status: 'ACTIVE', kycStatus: 'APPROVED', creditScore: 720, joinedAt: '2024-01-28' },
  { id: '8', firstName: 'Ouattara', lastName: 'Seydou', phone: '+2250809101112', email: 'ouattara@email.com', status: 'PENDING', kycStatus: 'PENDING', creditScore: 0, joinedAt: '2024-07-01' },
  { id: '9', firstName: 'Coulibaly', lastName: 'Awa', phone: '+2250910111213', email: 'coulibaly@email.com', status: 'ACTIVE', kycStatus: 'APPROVED', creditScore: 560, joinedAt: '2024-02-14' },
  { id: '10', firstName: 'Touré', lastName: 'Abdoulaye', phone: '+2251011121314', email: 'toure@email.com', status: 'ACTIVE', kycStatus: 'APPROVED', creditScore: 830, joinedAt: '2023-09-08' },
];

const columns: ColumnDef<Driver>[] = [
  {
    accessorKey: 'firstName',
    header: 'Conducteur',
    cell: ({ row }) => {
      const d = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(`${d.firstName} ${d.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {d.firstName} {d.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{d.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Téléphone',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
        {formatPhone(row.original.phone)}
      </div>
    ),
  },
  {
    accessorKey: 'kycStatus',
    header: 'KYC',
    cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
  },
  {
    accessorKey: 'creditScore',
    header: 'Score DAM',
    cell: ({ row }) => {
      const score = row.original.creditScore;
      if (score === 0)
        return <span className="text-sm text-muted-foreground">N/A</span>;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full', getScoreBgColor(score))}
              style={{ width: `${(score / 1000) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums">{score}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Voir le profil</DropdownMenuItem>
          <DropdownMenuItem>Modifier</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Suspendre</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function DriversPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDrivers =
    statusFilter === 'all'
      ? mockDrivers
      : mockDrivers.filter((d) => d.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conducteurs"
        description="Gérer les conducteurs de votre flotte"
        actions={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredDrivers}
        searchKey="firstName"
        searchPlaceholder="Rechercher un conducteur..."
        onRowClick={(driver) => router.push(`/drivers/${driver.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="SUSPENDED">Suspendu</SelectItem>
              <SelectItem value="INACTIVE">Inactif</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
