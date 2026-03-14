'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'DEFAULTED'
  | 'FAILED'
  | 'REFUNDED'
  | 'AVAILABLE'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'RETIRED'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'REPORTED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'OPEN'
  | 'IN_PROGRESS';

const statusConfig: Record<
  StatusType,
  { label: string; variant: string; dotColor: string }
> = {
  ACTIVE: { label: 'Actif', variant: 'success', dotColor: 'bg-emerald-500' },
  INACTIVE: { label: 'Inactif', variant: 'secondary', dotColor: 'bg-gray-400' },
  SUSPENDED: { label: 'Suspendu', variant: 'destructive', dotColor: 'bg-red-500' },
  PENDING: { label: 'En attente', variant: 'warning', dotColor: 'bg-amber-500' },
  APPROVED: { label: 'Approuvé', variant: 'success', dotColor: 'bg-emerald-500' },
  REJECTED: { label: 'Rejeté', variant: 'destructive', dotColor: 'bg-red-500' },
  COMPLETED: { label: 'Terminé', variant: 'info', dotColor: 'bg-blue-500' },
  DEFAULTED: { label: 'En défaut', variant: 'destructive', dotColor: 'bg-red-500' },
  FAILED: { label: 'Échoué', variant: 'destructive', dotColor: 'bg-red-500' },
  REFUNDED: { label: 'Remboursé', variant: 'secondary', dotColor: 'bg-gray-400' },
  AVAILABLE: { label: 'Disponible', variant: 'success', dotColor: 'bg-emerald-500' },
  RENTED: { label: 'Loué', variant: 'info', dotColor: 'bg-blue-500' },
  MAINTENANCE: { label: 'Maintenance', variant: 'warning', dotColor: 'bg-amber-500' },
  RETIRED: { label: 'Retiré', variant: 'secondary', dotColor: 'bg-gray-400' },
  EXPIRED: { label: 'Expiré', variant: 'secondary', dotColor: 'bg-gray-400' },
  TERMINATED: { label: 'Résilié', variant: 'destructive', dotColor: 'bg-red-500' },
  REPORTED: { label: 'Signalé', variant: 'warning', dotColor: 'bg-amber-500' },
  INVESTIGATING: { label: 'En cours', variant: 'info', dotColor: 'bg-blue-500' },
  RESOLVED: { label: 'Résolu', variant: 'success', dotColor: 'bg-emerald-500' },
  CLOSED: { label: 'Clôturé', variant: 'secondary', dotColor: 'bg-gray-400' },
  OPEN: { label: 'Ouvert', variant: 'warning', dotColor: 'bg-amber-500' },
  IN_PROGRESS: { label: 'En cours', variant: 'info', dotColor: 'bg-blue-500' },
};

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    label: status,
    variant: 'outline',
    dotColor: 'bg-gray-400',
  };

  return (
    <Badge
      variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'}
      className={cn('gap-1.5', className)}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      )}
      {config.label}
    </Badge>
  );
}
