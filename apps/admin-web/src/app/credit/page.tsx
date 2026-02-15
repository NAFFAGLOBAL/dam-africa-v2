'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

interface CreditScore {
  userId: string;
  user: {
    name: string;
    email: string;
  };
  score: number;
  rating: string;
  updatedAt: string;
}

export default function CreditScoresPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [scores, setScores] = useState<CreditScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  });
  const [filters, setFilters] = useState({
    rating: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchCreditScores();
  }, [filters, pagination.page, router]);

  const fetchCreditScores = async () => {
    setLoading(true);
    const response = await api.getCreditScores({
      page: pagination.page,
      limit: pagination.limit,
      rating: filters.rating || undefined,
      search: filters.search || undefined,
    });

    if (response.success && response.data) {
      setScores(response.data.scores || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
      }));

      // Calculate stats
      const allScores = response.data.scores || [];
      const avgScore = allScores.reduce((sum: number, s: any) => sum + s.score, 0) / (allScores.length || 1);
      setStats({
        average: Math.round(avgScore),
        A: allScores.filter((s: any) => s.rating === 'A').length,
        B: allScores.filter((s: any) => s.rating === 'B').length,
        C: allScores.filter((s: any) => s.rating === 'C').length,
        D: allScores.filter((s: any) => s.rating === 'D').length,
        E: allScores.filter((s: any) => s.rating === 'E').length,
      });
    }
    setLoading(false);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'B':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'E':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreGaugeColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 700) return 'text-blue-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar admin={admin} />

      <main className="flex-1 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scores de Crédit</h1>
          <p className="text-gray-600 mt-1">Analyse des scores de crédit des conducteurs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Score Moyen</div>
            <div className="text-3xl font-bold text-blue-600">{stats.average}</div>
            <div className="text-xs text-gray-500 mt-1">Sur 1000</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="text-sm font-medium text-gray-500 mb-1">Rating A</div>
            <div className="text-3xl font-bold text-green-600">{stats.A}</div>
            <div className="text-xs text-gray-500 mt-1">Excellent</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="text-sm font-medium text-gray-500 mb-1">Rating B</div>
            <div className="text-3xl font-bold text-blue-600">{stats.B}</div>
            <div className="text-xs text-gray-500 mt-1">Très bon</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
            <div className="text-sm font-medium text-gray-500 mb-1">Rating C</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.C}</div>
            <div className="text-xs text-gray-500 mt-1">Moyen</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
            <div className="text-sm font-medium text-gray-500 mb-1">Rating D</div>
            <div className="text-3xl font-bold text-orange-600">{stats.D}</div>
            <div className="text-xs text-gray-500 mt-1">Faible</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <div className="text-sm font-medium text-gray-500 mb-1">Rating E</div>
            <div className="text-3xl font-bold text-red-600">{stats.E}</div>
            <div className="text-xs text-gray-500 mt-1">Très faible</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom du conducteur..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les ratings</option>
                <option value="A">A - Excellent (800-1000)</option>
                <option value="B">B - Très bon (700-799)</option>
                <option value="C">C - Moyen (600-699)</option>
                <option value="D">D - Faible (500-599)</option>
                <option value="E">E - Très faible (0-499)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scores Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Scores des Conducteurs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conducteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière mise à jour
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : scores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun score trouvé
                    </td>
                  </tr>
                ) : (
                  scores.map((score) => (
                    <tr
                      key={score.userId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/credit/${score.userId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{score.user.name}</div>
                        <div className="text-sm text-gray-500">{score.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${getScoreGaugeColor(score.score)}`}>
                            {score.score}
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${getScoreGaugeColor(score.score).replace('text-', 'bg-')} h-2 rounded-full`}
                              style={{ width: `${(score.score / 1000) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-lg font-bold rounded-full border ${getRatingColor(
                            score.rating
                          )}`}
                        >
                          {score.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(score.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/credit/${score.userId}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir détails →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.total > pagination.limit && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  sur <span className="font-medium">{pagination.total}</span> résultats
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
