'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Loan {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    creditScore: number;
    creditRating: string;
  };
  amount: number;
  interestRate: number;
  termWeeks: number;
  weeklyPayment: number;
  totalAmount: number;
  remainingBalance: number;
  status: string;
  purpose: string;
  createdAt: string;
  disbursedAt?: string;
}

export default function LoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    completed: 0,
    total: 0,
    totalDisbursed: 0,
  });
  const [filters, setFilters] = useState({
    status: 'PENDING',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchLoans();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchLoans = async () => {
    setLoading(true);
    const response = await api.getLoans({
      status: filters.status || undefined,
      page: pagination.page,
      limit: pagination.limit,
    });

    if (response.success && response.data) {
      setLoans(response.data.loans || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
      }));
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const allLoans = await api.getLoans({});
    if (allLoans.success && allLoans.data) {
      const loans = allLoans.data.loans || [];
      setStats({
        pending: loans.filter((l: any) => l.status === 'PENDING').length,
        active: loans.filter((l: any) => l.status === 'ACTIVE').length,
        completed: loans.filter((l: any) => l.status === 'COMPLETED').length,
        total: loans.length,
        totalDisbursed: loans
          .filter((l: any) => l.status === 'ACTIVE' || l.status === 'COMPLETED')
          .reduce((sum: number, l: any) => sum + Number(l.amount), 0),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DEFAULTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCreditRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'E':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
  };

  const getPurposeLabel = (purpose: string) => {
    const labels: { [key: string]: string } = {
      VEHICLE_PURCHASE: 'Achat véhicule',
      VEHICLE_REPAIR: 'Réparation véhicule',
      FUEL: 'Carburant',
      INSURANCE: 'Assurance',
      OTHER: 'Autre',
    };
    return labels[purpose] || purpose;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Prêts</h1>
                <p className="text-sm text-gray-500">
                  {stats.pending} demande{stats.pending !== 1 ? 's' : ''} en attente
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">En Attente</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">À réviser</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Actifs</div>
            <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            <div className="text-xs text-gray-500 mt-1">En cours de remboursement</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Complétés</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">Remboursés</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Décaissé</div>
            <div className="text-2xl font-bold text-gray-900">
              {(stats.totalDisbursed / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-500 mt-1">CFA total</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvé (non décaissé)</option>
                <option value="ACTIVE">Actif</option>
                <option value="COMPLETED">Complété</option>
                <option value="REJECTED">Rejeté</option>
                <option value="DEFAULTED">En défaut</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loans List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Demandes de prêt</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Chargement...</div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {filters.status === 'PENDING'
                  ? '🎉 Aucune demande en attente!'
                  : 'Aucun prêt trouvé avec ces filtres.'}
              </div>
            ) : (
              loans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/loans/${loan.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {loan.user.name}
                        </h3>
                        <span
                          className={`text-2xl font-bold ${getCreditRatingColor(
                            loan.user.creditRating
                          )}`}
                        >
                          {loan.user.creditRating}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            loan.status
                          )}`}
                        >
                          {loan.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500">Montant demandé</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(loan.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Durée</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {loan.termWeeks} semaines
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Paiement/semaine</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(loan.weeklyPayment)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Score crédit</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {loan.user.creditScore}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Objectif: <strong>{getPurposeLabel(loan.purpose)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Taux: <strong>{loan.interestRate}%</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Demandé le:{' '}
                          {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {loan.disbursedAt && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Décaissé le{' '}
                          {new Date(loan.disbursedAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}

                      {loan.status === 'ACTIVE' && (
                        <div className="mt-2 text-sm text-blue-600">
                          Solde restant: {formatCurrency(loan.remainingBalance)}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/loans/${loan.id}`);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          loan.status === 'PENDING'
                            ? 'text-white bg-blue-600 hover:bg-blue-700'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {loan.status === 'PENDING' ? 'Réviser →' : 'Voir →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
