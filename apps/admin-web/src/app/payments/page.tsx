'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Payment {
  id: string;
  loanId: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  loan: {
    amount: number;
    status: string;
  };
  amount: number;
  method: string;
  status: string;
  transactionReference: string;
  createdAt: string;
  processedAt?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    failed: 0,
    total: 0,
    totalAmount: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchPayments = async () => {
    setLoading(true);
    const response = await api.getPayments({
      status: filters.status || undefined,
      page: pagination.page,
      limit: pagination.limit,
    });

    if (response.success && response.data) {
      setPayments(response.data.payments || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
      }));
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const allPayments = await api.getPayments({});
    if (allPayments.success && allPayments.data) {
      const payments = allPayments.data.payments || [];
      const completed = payments.filter((p: any) => p.status === 'COMPLETED');
      setStats({
        completed: completed.length,
        pending: payments.filter((p: any) => p.status === 'PENDING').length,
        failed: payments.filter((p: any) => p.status === 'FAILED').length,
        total: payments.length,
        totalAmount: completed.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return '📱';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'CASH':
        return '💵';
      case 'CARD':
        return '💳';
      default:
        return '💰';
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      MOBILE_MONEY: 'Mobile Money',
      BANK_TRANSFER: 'Virement bancaire',
      CASH: 'Espèces',
      CARD: 'Carte bancaire',
    };
    return labels[method] || method;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
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
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
                <p className="text-sm text-gray-500">
                  {stats.pending} paiement{stats.pending !== 1 ? 's' : ''} en attente
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
            <div className="text-sm font-medium text-gray-500 mb-1">Réussis</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% du
              total
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">En Attente</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">À traiter</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Échoués</div>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-gray-500 mt-1">Nécessite attention</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Montant Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {(stats.totalAmount / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-500 mt-1">CFA reçus</div>
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
                <option value="COMPLETED">Réussi</option>
                <option value="PENDING">En attente</option>
                <option value="FAILED">Échoué</option>
                <option value="REFUNDED">Remboursé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historique des Paiements</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Chargement...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun paiement trouvé avec ces filtres.
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/payments/${payment.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getMethodIcon(payment.method)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.user.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500">Montant</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Méthode</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {getMethodLabel(payment.method)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Référence</div>
                          <div className="text-sm font-mono text-gray-900">
                            {payment.transactionReference}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="text-sm text-gray-900">
                            {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{payment.user.email}</span>
                        {payment.processedAt && (
                          <>
                            <span>•</span>
                            <span>
                              Traité le{' '}
                              {new Date(payment.processedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/payments/${payment.id}`);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          payment.status === 'PENDING'
                            ? 'text-white bg-blue-600 hover:bg-blue-700'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {payment.status === 'PENDING' ? 'Traiter →' : 'Voir →'}
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
