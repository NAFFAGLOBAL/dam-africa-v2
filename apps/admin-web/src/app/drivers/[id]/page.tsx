'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'kyc' | 'loans' | 'payments'>('info');

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    const response = await api.getUser(userId);
    if (response.success && response.data) {
      setUser(response.data);
    }
    setLoading(false);
  };

  const handleSuspend = async () => {
    const reason = prompt('Raison de suspension:');
    if (!reason) return;

    const response = await api.suspendUser(userId, reason);
    if (response.success) {
      alert('Utilisateur suspendu avec succès');
      fetchUserDetails();
    } else {
      alert('Erreur lors de la suspension');
    }
  };

  const handleActivate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir activer cet utilisateur?')) return;

    const response = await api.activateUser(userId);
    if (response.success) {
      alert('Utilisateur activé avec succès');
      fetchUserDetails();
    } else {
      alert('Erreur lors de l\'activation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Utilisateur non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/drivers')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {user.status === 'ACTIVE' ? (
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Suspendre
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Activer
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Score Crédit</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-gray-900">{user.creditScore}</div>
              <div className="text-2xl font-bold text-blue-600">{user.creditRating || '-'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Statut KYC</div>
            <div className="text-lg font-semibold text-gray-900">{user.kycStatus}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Prêts Actifs</div>
            <div className="text-3xl font-bold text-gray-900">
              {user.loans?.filter((l: any) => l.status === 'ACTIVE').length || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Statut Compte</div>
            <div className="text-lg font-semibold text-gray-900">{user.status}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {[
                { id: 'info', label: 'Informations' },
                { id: 'kyc', label: 'Documents KYC' },
                { id: 'loans', label: 'Prêts' },
                { id: 'payments', label: 'Paiements' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informations Personnelles
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString('fr-FR')
                          : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.address || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ville</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.city || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pays</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.country}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Inscrit le</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Score de Crédit</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Score Total</span>
                      <span className="text-2xl font-bold text-gray-900">{user.creditScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Note</span>
                      <span className="text-2xl font-bold text-blue-600">{user.creditRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents KYC</h3>
                {user.kycDocuments && user.kycDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {user.kycDocuments.map((doc: any) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{doc.documentType}</div>
                            <div className="text-sm text-gray-500">
                              {doc.documentNumber || 'N/A'}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              doc.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : doc.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        {doc.rejectionReason && (
                          <div className="mt-2 text-sm text-red-600">
                            Raison: {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun document KYC soumis
                  </div>
                )}
              </div>
            )}

            {activeTab === 'loans' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Prêts</h3>
                {user.loans && user.loans.length > 0 ? (
                  <div className="space-y-4">
                    {user.loans.map((loan: any) => (
                      <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {loan.amount.toLocaleString()} CFA
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              loan.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : loan.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : loan.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Durée: {loan.termWeeks} semaines</div>
                          <div>Taux: {loan.interestRate}%</div>
                          <div>Paiement/semaine: {loan.weeklyPayment.toLocaleString()} CFA</div>
                          <div>
                            Créé le: {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Aucun prêt</div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Historique des Paiements
                </h3>
                {user.payments && user.payments.length > 0 ? (
                  <div className="space-y-4">
                    {user.payments.map((payment: any) => (
                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {payment.amount.toLocaleString()} CFA
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Méthode: {payment.method}</div>
                          <div>Référence: {payment.transactionReference}</div>
                          <div>
                            Date: {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Aucun paiement</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
