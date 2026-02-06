'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DAM Africa</h1>
              <p className="text-sm text-gray-500">Admin Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                <p className="text-xs text-gray-500">{admin?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Conducteurs</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Prêts Actifs</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.loans?.active || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Sur {stats?.loans?.total || 0} total</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Paiements Réussis</div>
            <div className="text-3xl font-bold text-green-600">{stats?.payments?.total || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-sm font-medium text-gray-900">Conducteurs</div>
              <div className="text-xs text-gray-500 mt-1">Gérer les conducteurs</div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-sm font-medium text-gray-900">Vérification KYC</div>
              <div className="text-xs text-gray-500 mt-1">Réviser les documents</div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-sm font-medium text-gray-900">Demandes de Prêt</div>
              <div className="text-xs text-gray-500 mt-1">Approuver/Rejeter</div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-sm font-medium text-gray-900">Paiements</div>
              <div className="text-xs text-gray-500 mt-1">Suivre les paiements</div>
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 En Construction</h3>
          <p className="text-blue-700">
            Les pages complètes de gestion (conducteurs, KYC, prêts, paiements) seront disponibles dans la Phase 2.
            Le backend API est 100% prêt et fonctionnel.
          </p>
        </div>
      </main>
    </div>
  );
}
