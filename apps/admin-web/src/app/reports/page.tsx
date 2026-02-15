'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

interface ReportData {
  financial: {
    totalDisbursed: number;
    totalCollected: number;
    outstanding: number;
    revenue: number;
  };
  loans: {
    byStatus: {
      [key: string]: number;
    };
    approvalRate: number;
    defaultRate: number;
    averageAmount: number;
  };
  payments: {
    byMethod: {
      [key: string]: number;
    };
    collectionRate: number;
    totalByStatus: {
      [key: string]: number;
    };
  };
  drivers: {
    byKycStatus: {
      [key: string]: number;
    };
    creditScoreDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
    };
    averageScore: number;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchReports();
  }, [dateRange, router]);

  const fetchReports = async () => {
    setLoading(true);

    const [financial, loans, payments, drivers] = await Promise.all([
      api.getFinancialSummary(dateRange),
      api.getLoanAnalytics(dateRange),
      api.getPaymentAnalytics(dateRange),
      api.getDriverAnalytics(),
    ]);

    if (financial.success && loans.success && payments.success && drivers.success) {
      setReportData({
        financial: financial.data,
        loans: loans.data,
        payments: payments.data,
        drivers: drivers.data,
      });
    }

    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + 'M CFA';
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar admin={admin} />

      <main className="flex-1 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-gray-600 mt-1">Analyses détaillées de votre plateforme</p>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Période d'Analyse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Résumé Financier</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Décaissé</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(reportData?.financial.totalDisbursed || 0)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Recouvré</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(reportData?.financial.totalCollected || 0)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
              <div className="text-sm font-medium text-gray-500 mb-1">Encours</div>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(reportData?.financial.outstanding || 0)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
              <div className="text-sm font-medium text-gray-500 mb-1">Revenu (Intérêts)</div>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(reportData?.financial.revenue || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Loan Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyse des Prêts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loans by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prêts par Statut</h3>
              <div className="space-y-3">
                {Object.entries(reportData?.loans.byStatus || {}).map(([status, count]) => {
                  const total = Object.values(reportData?.loans.byStatus || {}).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const colors: { [key: string]: string } = {
                    PENDING: 'yellow',
                    APPROVED: 'green',
                    ACTIVE: 'blue',
                    COMPLETED: 'gray',
                    REJECTED: 'red',
                    DEFAULTED: 'red',
                  };
                  const color = colors[status] || 'gray';

                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-${color}-600 h-3 rounded-full flex items-center justify-end pr-2`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Loan Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques Clés</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Taux d'Approbation</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercent(reportData?.loans.approvalRate || 0)}
                    </div>
                  </div>
                  <span className="text-3xl">✓</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Taux de Défaut</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatPercent(reportData?.loans.defaultRate || 0)}
                    </div>
                  </div>
                  <span className="text-3xl">⚠</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Montant Moyen</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData?.loans.averageAmount || 0)}
                    </div>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyse des Paiements</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payments by Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Paiements par Méthode
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData?.payments.byMethod || {}).map(([method, count]) => {
                  const total = Object.values(reportData?.payments.byMethod || {}).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const colors: { [key: string]: string } = {
                    WAVE: 'blue',
                    ORANGE_MONEY: 'orange',
                    MTN_MONEY: 'yellow',
                    MOOV_MONEY: 'cyan',
                  };
                  const color = colors[method] || 'gray';

                  return (
                    <div key={method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{method.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-${color}-600 h-3 rounded-full flex items-center justify-end pr-2`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statut des Paiements
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData?.payments.totalByStatus || {}).map(
                  ([status, amount]) => {
                    const total = Object.values(reportData?.payments.totalByStatus || {}).reduce(
                      (sum, val) => sum + val,
                      0
                    );
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    const colors: { [key: string]: string } = {
                      SUCCESS: 'green',
                      PENDING: 'yellow',
                      FAILED: 'red',
                    };
                    const color = colors[status] || 'gray';

                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{status}</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`bg-${color}-600 h-3 rounded-full flex items-center justify-end pr-2`}
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Taux de Recouvrement
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPercent(reportData?.payments.collectionRate || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyse des Conducteurs</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By KYC Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Conducteurs par Statut KYC
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData?.drivers.byKycStatus || {}).map(([status, count]) => {
                  const total = Object.values(reportData?.drivers.byKycStatus || {}).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const colors: { [key: string]: string } = {
                    NOT_STARTED: 'gray',
                    PENDING: 'yellow',
                    VERIFIED: 'green',
                    REJECTED: 'red',
                  };
                  const color = colors[status] || 'gray';

                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{status.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-${color}-600 h-3 rounded-full flex items-center justify-end pr-2`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credit Score Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribution des Scores de Crédit
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData?.drivers.creditScoreDistribution || {}).map(
                  ([rating, count]) => {
                    const total = Object.values(
                      reportData?.drivers.creditScoreDistribution || {}
                    ).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const colors: { [key: string]: string } = {
                      A: 'green',
                      B: 'blue',
                      C: 'yellow',
                      D: 'orange',
                      E: 'red',
                    };
                    const color = colors[rating] || 'gray';

                    return (
                      <div key={rating}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`font-bold text-${color}-600`}>{rating}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`bg-${color}-600 h-3 rounded-full flex items-center justify-end pr-2`}
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Score Moyen</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {reportData?.drivers.averageScore || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
