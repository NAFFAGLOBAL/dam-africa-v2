'use client';

import {
  UserPlus,
  Car,
  FileText,
  CreditCard,
  Shield,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'Nouveau conducteur',
    icon: UserPlus,
    href: '/drivers',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    label: 'Ajouter véhicule',
    icon: Car,
    href: '/vehicles',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    label: 'Revue KYC',
    icon: Shield,
    href: '/kyc',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    label: 'Nouveau prêt',
    icon: FileText,
    href: '/loans',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    label: 'Paiements',
    icon: CreditCard,
    href: '/payments',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
  },
  {
    label: 'Rapports',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent hover:border-border hover:bg-accent/50 transition-all group"
            >
              <div
                className={cn(
                  'h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                  action.bg
                )}
              >
                <action.icon className={cn('h-5 w-5', action.color)} />
              </div>
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
