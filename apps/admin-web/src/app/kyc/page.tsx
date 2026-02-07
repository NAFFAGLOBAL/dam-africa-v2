'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface KYCDocument {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  documentType: string;
  documentNumber: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    name: string;
  };
}

export default function KYCQueuePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: 'PENDING',
    documentType: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchDocuments = async () => {
    setLoading(true);
    const response = await api.getKYCDocuments({
      status: filters.status || undefined,
      page: pagination.page,
      limit: pagination.limit,
    });

    if (response.success && response.data) {
      setDocuments(response.data.documents || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
      }));
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // This would come from a dedicated stats endpoint
    // For now, we'll calculate from the documents
    const allDocs = await api.getKYCDocuments({});
    if (allDocs.success && allDocs.data) {
      const docs = allDocs.data.documents || [];
      setStats({
        pending: docs.filter((d: any) => d.status === 'PENDING').length,
        approved: docs.filter((d: any) => d.status === 'APPROVED').length,
        rejected: docs.filter((d: any) => d.status === 'REJECTED').length,
        total: docs.length,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      ID_CARD: 'Carte d\'identité',
      PASSPORT: 'Passeport',
      DRIVERS_LICENSE: 'Permis de conduire',
      SELFIE: 'Photo selfie',
      VEHICLE_REGISTRATION: 'Carte grise',
      PROOF_OF_ADDRESS: 'Justificatif de domicile',
    };
    return labels[type] || type;
  };

  const getPriorityBadge = (document: KYCDocument) => {
    const hoursSinceSubmission = (Date.now() - new Date(document.createdAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSubmission > 48) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          🔴 Urgent
        </span>
      );
    } else if (hoursSinceSubmission > 24) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          🟠 Priorité
        </span>
      );
    }
    return null;
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
                <h1 className="text-2xl font-bold text-gray-900">Vérification KYC</h1>
                <p className="text-sm text-gray-500">
                  {stats.pending} document{stats.pending !== 1 ? 's' : ''} en attente
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
            <div className="text-sm font-medium text-gray-500 mb-1">Approuvés</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% du total
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Rejetés</div>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% du total
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Tous documents</div>
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
                <option value="APPROVED">Approuvé</option>
                <option value="REJECTED">Rejeté</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document
              </label>
              <select
                value={filters.documentType}
                onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="ID_CARD">Carte d'identité</option>
                <option value="PASSPORT">Passeport</option>
                <option value="DRIVERS_LICENSE">Permis de conduire</option>
                <option value="SELFIE">Photo selfie</option>
                <option value="PROOF_OF_ADDRESS">Justificatif de domicile</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              File d'attente KYC
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Chargement...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {filters.status === 'PENDING' 
                  ? '🎉 Aucun document en attente! Vous êtes à jour.'
                  : 'Aucun document trouvé avec ces filtres.'}
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/kyc/${doc.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doc.user.name}
                        </h3>
                        {getPriorityBadge(doc)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            doc.status
                          )}`}
                        >
                          {doc.status === 'PENDING' && '⏳ En attente'}
                          {doc.status === 'APPROVED' && '✓ Approuvé'}
                          {doc.status === 'REJECTED' && '✗ Rejeté'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {getDocumentTypeLabel(doc.documentType)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">N°:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {doc.documentNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Soumis le:</span>{' '}
                          <span className="font-medium text-gray-900">
                            {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        {doc.user.email} • {doc.user.phone}
                      </div>

                      {doc.reviewedAt && (
                        <div className="mt-2 text-sm text-gray-500">
                          Révisé le {new Date(doc.reviewedAt).toLocaleDateString('fr-FR')}
                          {doc.reviewedBy && ` par ${doc.reviewedBy.name}`}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/kyc/${doc.id}`);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Réviser →
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
