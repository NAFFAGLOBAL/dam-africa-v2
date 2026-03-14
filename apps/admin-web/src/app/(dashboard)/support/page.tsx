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
import { MessageCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

interface Ticket {
  id: string;
  subject: string;
  driverName: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  lastReply: string;
  messages: number;
}

const mockTickets: Ticket[] = [
  { id: 'T1', subject: 'Problème de paiement Wave', driverName: 'Kouamé Jean', category: 'Paiement', priority: 'Haute', status: 'OPEN', createdAt: '2024-07-28', lastReply: '2024-07-29', messages: 3 },
  { id: 'T2', subject: 'Demande de changement de véhicule', driverName: 'Traoré Fatou', category: 'Véhicule', priority: 'Moyenne', status: 'IN_PROGRESS', createdAt: '2024-07-25', lastReply: '2024-07-27', messages: 5 },
  { id: 'T3', subject: 'Mise à jour documents KYC', driverName: 'Diallo Moussa', category: 'KYC', priority: 'Basse', status: 'RESOLVED', createdAt: '2024-07-20', lastReply: '2024-07-22', messages: 2 },
  { id: 'T4', subject: 'Application mobile ne fonctionne pas', driverName: 'Yao Koffi', category: 'Technique', priority: 'Haute', status: 'OPEN', createdAt: '2024-07-29', lastReply: '2024-07-29', messages: 1 },
  { id: 'T5', subject: 'Question sur le contrat', driverName: 'Kone Aminata', category: 'Contrat', priority: 'Moyenne', status: 'CLOSED', createdAt: '2024-07-15', lastReply: '2024-07-18', messages: 4 },
];

const priorityColors: Record<string, string> = {
  'Haute': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Moyenne': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Basse': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const summaryCards = [
  { label: 'Ouverts', count: 2, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { label: 'En cours', count: 1, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Résolus', count: 1, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { label: 'Fermés', count: 1, icon: MessageCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30' },
];

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'subject',
    header: 'Sujet',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.subject}</p>
        <p className="text-xs text-muted-foreground">#{row.original.id}</p>
      </div>
    ),
  },
  {
    accessorKey: 'driverName',
    header: 'Conducteur',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {getInitials(row.original.driverName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{row.original.driverName}</span>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
  },
  {
    accessorKey: 'priority',
    header: 'Priorité',
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          priorityColors[row.original.priority] || ''
        }`}
      >
        {row.original.priority}
      </span>
    ),
  },
  {
    accessorKey: 'messages',
    header: 'Messages',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm">{row.original.messages}</span>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Créé le',
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTickets =
    statusFilter === 'all'
      ? mockTickets
      : mockTickets.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Gérer les tickets de support conducteurs"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.count}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredTickets}
        searchKey="subject"
        searchPlaceholder="Rechercher un ticket..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="OPEN">Ouvert</SelectItem>
              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
              <SelectItem value="RESOLVED">Résolu</SelectItem>
              <SelectItem value="CLOSED">Fermé</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
