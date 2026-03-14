'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials, formatDate } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

const mockAdminUsers: AdminUser[] = [
  { id: '1', firstName: 'Amadou', lastName: 'Diarra', email: 'amadou@damflotte.com', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '2024-07-29', createdAt: '2023-01-01' },
  { id: '2', firstName: 'Fatoumata', lastName: 'Koné', email: 'fatoumata@damflotte.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2024-07-28', createdAt: '2023-06-15' },
  { id: '3', firstName: 'Ibrahim', lastName: 'Sow', email: 'ibrahim@damflotte.com', role: 'LOAN_OFFICER', status: 'ACTIVE', lastLogin: '2024-07-29', createdAt: '2024-01-10' },
  { id: '4', firstName: 'Marie', lastName: 'Konan', email: 'marie@damflotte.com', role: 'FINANCE', status: 'ACTIVE', lastLogin: '2024-07-27', createdAt: '2024-02-20' },
  { id: '5', firstName: 'Paul', lastName: 'N\'Guessan', email: 'paul@damflotte.com', role: 'SUPPORT', status: 'SUSPENDED', lastLogin: '2024-06-15', createdAt: '2024-03-01' },
];

const roleVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning'> = {
  SUPER_ADMIN: 'default',
  ADMIN: 'info',
  LOAN_OFFICER: 'success',
  FINANCE: 'warning',
  SUPPORT: 'secondary',
};

const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: 'firstName',
    header: 'Utilisateur',
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(`${u.firstName} ${u.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => (
      <Badge variant={roleVariants[row.original.role] || 'outline'}>
        {ROLE_LABELS[row.original.role] || row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'lastLogin',
    header: 'Dernière connexion',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.original.lastLogin)}</span>
    ),
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Modifier</DropdownMenuItem>
          <DropdownMenuItem>Réinitialiser le mot de passe</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Suspendre</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function UsersPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs admin"
        description="Gérer les comptes administrateurs"
        actions={
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={mockAdminUsers}
        searchKey="firstName"
        searchPlaceholder="Rechercher un utilisateur..."
      />

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un administrateur</DialogTitle>
            <DialogDescription>
              Créer un nouveau compte administrateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input placeholder="Prénom" />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input placeholder="Nom" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@damflotte.com" />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="LOAN_OFFICER">Agent de crédit</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setAddDialogOpen(false)}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
