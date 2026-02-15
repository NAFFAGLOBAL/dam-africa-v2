'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface DashboardStats {
  users: {
    total: number;
    verified: number;
    active: number;
  };
  loans: {
    total: number;
    active: number;
    pending: number;
    completed: number;
    totalDisbursed: number;
  };
  payments: {
    total: number;
    totalAmount: number;
    successRate: number;
  };
  credit: {
    averageScore: number;
    ratingDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
    };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        // Simulate recent activity for now
        setRecentActivity([
          { type: 'loan', text: 'Nouveau prêt approuvé pour Jean Kouassi', time: 'Il y a 5 min' },
          { type: 'payment', text: 'Paiement reçu de Marie Koffi - 25,000 CFA', time: 'Il y a 12 min' },
          { type: 'kyc', text: 'Document KYC soumis par Yao Bamba', time: 'Il y a 23 min' },
          { type: 'loan', text: 'Demande de prêt en attente - Konan Adjé', time: 'Il y a 1h' },
          { type: 'kyc', text: 'KYC vérifié pour Aya Traoré', time: 'Il y a 2h' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + 'M CFA';
  };

  const calculateCollectionRate = () => {
    if (!stats) return '0';
    return stats.payments.successRate.toFixed(1);
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
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre plateforme de prêt</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Total Conducteurs</div>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</div>
            <div className="text-xs text-green-600 mt-1">+12% ce mois</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Conducteurs Vérifiés</div>
              <span className="text-2xl">✓</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats?.users?.verified || 0}</div>
            <div className="text-xs text-gray-500 mt-1">KYC approuvé</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Prêts Actifs</div>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats?.loans?.active || 0}</div>
            <div className="text-xs text-gray-500 mt-1">{stats?.loans?.pending || 0} en attente</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Montant Décaissé</div>
              <span className="text-2xl">💵</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.loans?.totalDisbursed || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total prêts</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Taux de Recouvrement</div>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{calculateCollectionRate()}%</div>
            <div className="text-xs text-gray-500 mt-1">Paiements réussis</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Score Crédit Moyen</div>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats?.credit?.averageScore || 650}</div>
            <div className="text-xs text-gray-500 mt-1">Sur 1000</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Loan Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des Prêts</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Actifs</span>
                  <span className="font-medium">{stats?.loans?.active || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.loans?.active || 0) / (stats?.loans?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">En attente</span>
                  <span className="font-medium">{stats?.loans?.pending || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.loans?.pending || 0) / (stats?.loans?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Complétés</span>
                  <span className="font-medium">{stats?.loans?.completed || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.loans?.completed || 0) / (stats?.loans?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Credit Score Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des Scores</h3>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D', 'E'].map((rating) => {
                const count = stats?.credit?.ratingDistribution?.[rating as keyof typeof stats.credit.ratingDistribution] || 0;
                const colors = { A: 'green', B: 'blue', C: 'yellow', D: 'orange', E: 'red' };
                const color = colors[rating as keyof typeof colors];
                return (
                  <div key={rating}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-bold text-${color}-600`}>{rating}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${color}-600 h-2 rounded-full`}
                        style={{
                          width: `${(count / (stats?.users?.total || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de Paiement</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Wave</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Orange Money</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">MTN Money</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'loan' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/drivers')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium text-gray-900">Conducteurs</div>
                <div className="text-xs text-gray-500 mt-1">Gérer les comptes</div>
              </button>

              <button
                onClick={() => router.push('/kyc')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm font-medium text-gray-900">KYC</div>
                <div className="text-xs text-gray-500 mt-1">Réviser documents</div>
              </button>

              <button
                onClick={() => router.push('/loans')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium text-gray-900">Prêts</div>
                <div className="text-xs text-gray-500 mt-1">{stats?.loans?.pending || 0} en attente</div>
              </button>

              <button
                onClick={() => router.push('/payments')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm font-medium text-gray-900">Paiements</div>
                <div className="text-xs text-gray-500 mt-1">Suivre paiements</div>
              </button>

              <button
                onClick={() => router.push('/credit')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-medium text-gray-900">Scores Crédit</div>
                <div className="text-xs text-gray-500 mt-1">Analyser scores</div>
              </button>

              <button
                onClick={() => router.push('/vehicles')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">🚗</div>
                <div className="text-sm font-medium text-gray-900">Véhicules</div>
                <div className="text-xs text-gray-500 mt-1">Gérer flotte</div>
              </button>

              <button
                onClick={() => router.push('/reports')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">📑</div>
                <div className="text-sm font-medium text-gray-900">Rapports</div>
                <div className="text-xs text-gray-500 mt-1">Voir analyses</div>
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium text-gray-900">Paramètres</div>
                <div className="text-xs text-gray-500 mt-1">Configuration</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
