'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

// Mock data for demo/development
const mockStats = {
  activeDrivers: { value: 1247, change: 12.5, previous: 1108 },
  activeVehicles: { value: 892, change: 8.3, previous: 823 },
  activeLoans: { value: 324, change: -2.1, previous: 331 },
  monthlyRevenue: { value: 47_850_000, change: 15.7, previous: 41_350_000 },
  pendingKyc: 18,
  pendingLoans: 12,
  overduePayments: 34,
  fleetUtilization: 87.5,
};

const mockRevenueChart = Array.from({ length: 12 }, (_, i) => {
  const months = [
    'Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Ao\u00fb', 'Sep', 'Oct', 'Nov', 'D\u00e9c',
  ];
  return {
    month: months[i],
    revenue: Math.floor(30_000_000 + Math.random() * 25_000_000),
    expenses: Math.floor(15_000_000 + Math.random() * 10_000_000),
  };
});

const mockRecentActivity = [
  {
    id: '1',
    type: 'kyc_submitted',
    message: 'Kouam\u00e9 Jean a soumis ses documents KYC',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'payment_received',
    message: 'Paiement de 250 000 FCFA re\u00e7u de Traor\u00e9 Fatou',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: 'loan_approved',
    message: 'Pr\u00eat de 3 500 000 FCFA approuv\u00e9 pour Diallo Moussa',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '4',
    type: 'vehicle_maintenance',
    message: 'Toyota Hilux AB-1234-CD plac\u00e9 en maintenance',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '5',
    type: 'driver_activated',
    message: 'Conducteur Yao Koffi activ\u00e9 apr\u00e8s v\u00e9rification KYC',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getStats();
        return res.data.data || res.data;
      } catch {
        return mockStats;
      }
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: mockStats,
  });
}

export function useRevenueChart(period?: string) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getRevenueChart(period);
        return res.data.data || res.data;
      } catch {
        return mockRevenueChart;
      }
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: mockRevenueChart,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getRecentActivity();
        return res.data.data || res.data;
      } catch {
        return mockRecentActivity;
      }
    },
    staleTime: 1000 * 60,
    placeholderData: mockRecentActivity,
  });
}
