'use client';

import { Users, Car, CreditCard, Wallet, FileCheck, Clock, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboardStats, useRevenueChart, useRecentActivity } from '@/hooks/useDashboard';
import { formatCurrencyShort } from '@/lib/utils';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const paymentStatusData = [
  { name: 'Effectué', value: 68, color: '#10b981' },
  { name: 'En attente', value: 18, color: '#f59e0b' },
  { name: 'Échoué', value: 8, color: '#ef4444' },
  { name: 'En retard', value: 6, color: '#8b5cf6' },
];

const fleetStatusData = [
  { label: 'En service', value: 78, color: 'bg-emerald-500' },
  { label: 'Disponible', value: 12, color: 'bg-blue-500' },
  { label: 'Maintenance', value: 7, color: 'bg-amber-500' },
  { label: 'Retiré', value: 3, color: 'bg-gray-400' },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart();
  const { data: activities } = useRecentActivity();

  if (statsLoading) {
    return <LoadingState type="page" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre flotte et activités
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Conducteurs actifs"
          value={stats?.activeDrivers?.value?.toLocaleString('fr-FR') || '1 247'}
          change={stats?.activeDrivers?.change ?? 12.5}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Véhicules en service"
          value={stats?.activeVehicles?.value?.toLocaleString('fr-FR') || '892'}
          change={stats?.activeVehicles?.change ?? 8.3}
          icon={Car}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Prêts actifs"
          value={stats?.activeLoans?.value?.toLocaleString('fr-FR') || '324'}
          change={stats?.activeLoans?.change ?? -2.1}
          icon={CreditCard}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Revenus du mois"
          value={formatCurrencyShort(stats?.monthlyRevenue?.value || 47_850_000)}
          change={stats?.monthlyRevenue?.change ?? 15.7}
          icon={Wallet}
          iconColor="text-amber-500"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.pendingKyc ?? 18}</p>
              <p className="text-xs text-muted-foreground">KYC en attente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.pendingLoans ?? 12}</p>
              <p className="text-xs text-muted-foreground">Prêts en attente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.overduePayments ?? 34}</p>
              <p className="text-xs text-muted-foreground">Paiements en retard</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData || []} />
        </div>

        {/* Payment Status Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Statut des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {paymentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-semibold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={activities || []} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Fleet Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">État de la flotte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-stat">{stats?.fleetUtilization?.toFixed(1) ?? '87.5'}%</p>
              <p className="text-sm text-muted-foreground">Taux d&apos;utilisation</p>
            </div>
            {fleetStatusData.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
