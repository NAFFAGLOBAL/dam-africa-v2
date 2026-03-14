'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrencyShort } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 32000000, target: 30000000 },
  { month: 'Fév', revenue: 35000000, target: 32000000 },
  { month: 'Mar', revenue: 38000000, target: 34000000 },
  { month: 'Avr', revenue: 36000000, target: 36000000 },
  { month: 'Mai', revenue: 42000000, target: 38000000 },
  { month: 'Jun', revenue: 40000000, target: 40000000 },
  { month: 'Jul', revenue: 45000000, target: 42000000 },
  { month: 'Aoû', revenue: 47850000, target: 44000000 },
];

const driverGrowthData = [
  { month: 'Jan', newDrivers: 45, totalDrivers: 980 },
  { month: 'Fév', newDrivers: 52, totalDrivers: 1032 },
  { month: 'Mar', newDrivers: 38, totalDrivers: 1070 },
  { month: 'Avr', newDrivers: 61, totalDrivers: 1131 },
  { month: 'Mai', newDrivers: 48, totalDrivers: 1179 },
  { month: 'Jun', newDrivers: 35, totalDrivers: 1214 },
  { month: 'Jul', newDrivers: 33, totalDrivers: 1247 },
];

const fleetUtilizationData = [
  { month: 'Jan', utilization: 82 },
  { month: 'Fév', utilization: 85 },
  { month: 'Mar', utilization: 83 },
  { month: 'Avr', utilization: 87 },
  { month: 'Mai', utilization: 89 },
  { month: 'Jun', utilization: 86 },
  { month: 'Jul', utilization: 87.5 },
];

const paymentMethodData = [
  { name: 'Wave', value: 42, color: '#1a56db' },
  { name: 'Orange Money', value: 28, color: '#f97316' },
  { name: 'MTN MoMo', value: 18, color: '#eab308' },
  { name: 'Espèces', value: 8, color: '#10b981' },
  { name: 'Virement', value: 4, color: '#8b5cf6' },
];

const scoreDistributionData = [
  { range: '0-200', count: 15, color: '#ef4444' },
  { range: '200-400', count: 45, color: '#f97316' },
  { range: '400-600', count: 180, color: '#eab308' },
  { range: '600-800', count: 520, color: '#3b82f6' },
  { range: '800-1000', count: 487, color: '#10b981' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytique"
        description="Rapports et analyse de la performance"
      />

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendance des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a56db" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrencyShort(v)} className="text-xs fill-muted-foreground" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value: number, name: string) => [formatCurrencyShort(value), name === 'revenue' ? 'Revenus' : 'Objectif']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1a56db" strokeWidth={2} fill="url(#revGrad)" />
                <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Croissance des conducteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }} />
                  <Bar dataKey="newDrivers" fill="#1a56db" radius={[4, 4, 0, 0]} name="Nouveaux conducteurs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilisation de la flotte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fleetUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} domain={[75, 95]} className="text-xs fill-muted-foreground" tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }} formatter={(value: number) => [`${value}%`, 'Utilisation']} />
                  <Line type="monotone" dataKey="utilization" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Taux d'utilisation" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des méthodes de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }} formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {paymentMethodData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution des scores DAM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }} formatter={(value: number) => [value, 'Conducteurs']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Conducteurs">
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
