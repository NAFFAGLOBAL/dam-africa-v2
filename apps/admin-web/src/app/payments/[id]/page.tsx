'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processStatus, setProcessStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [failureReason, setFailureReason] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const fetchPayment = async () => {
    setLoading(true);
    const response = await api.getPayment(paymentId);
    if (response.success && response.data) {
      setPayment(response.data);
    }
    setLoading(false);
  };

  const handleProcess = async () => {
    setProcessing(true);
    const response = await api.processPayment(
      paymentId,
      processStatus,
      processStatus === 'FAILED' ? failureReason : undefined
    );

    if (response.success) {
      alert('✅ Paiement traité avec succès!');
      setShowProcessModal(false);
      fetchPayment();
    } else {
      alert('❌ Erreur lors du traitement');
    }
    setProcessing(false);
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert('Veuillez indiquer une raison de remboursement');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir rembourser ce paiement?')) return;

    setProcessing(true);
    // Call refund API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/${paymentId}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reason: refundReason }),
      }
    );

    if (response.ok) {
      alert('✅ Remboursement effectué avec succès!');
      setShowRefundModal(false);
      fetchPayment();
    } else {
      alert('❌ Erreur lors du remboursement');
    }
    setProcessing(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
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

  const failureTemplates = [
    'Fonds insuffisants',
    'Transaction expirée',
    'Compte bloqué',
    'Erreur réseau',
    'Transaction annulée par l\'utilisateur',
    'Limite de transaction dépassée',
  ];

  const refundTemplates = [
    'Paiement en double',
    'Erreur de montant',
    'Annulation de prêt',
    'Demande du client',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Paiement non trouvé</div>
      </div>
    );
  }

  const canProcess = payment.status === 'PENDING';
  const canRefund = payment.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/payments')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Paiement - {payment.user.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Réf: {payment.transactionReference}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {canProcess && (
                <button
                  onClick={() => setShowProcessModal(true)}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  ⚙️ Traiter
                </button>
              )}
              {canRefund && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  ↩️ Rembourser
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div
              className={`rounded-lg p-4 border ${
                payment.status === 'COMPLETED'
                  ? 'bg-green-50 border-green-200'
                  : payment.status === 'PENDING'
                  ? 'bg-yellow-50 border-yellow-200'
                  : payment.status === 'FAILED'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {payment.status === 'COMPLETED' && '✅'}
                  {payment.status === 'PENDING' && '⏳'}
                  {payment.status === 'FAILED' && '❌'}
                  {payment.status === 'REFUNDED' && '↩️'}
                </span>
                <div>
                  <div className="font-semibold text-gray-900">
                    Statut: {payment.status}
                  </div>
                  {payment.processedAt && (
                    <div className="text-sm text-gray-600">
                      Traité le {new Date(payment.processedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {payment.failureReason && (
                    <div className="text-sm text-red-700 mt-1">
                      Raison: {payment.failureReason}
                    </div>
                  )}
                  {payment.refundReason && (
                    <div className="text-sm text-gray-700 mt-1">
                      Raison du remboursement: {payment.refundReason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails du Paiement
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="text-sm text-gray-500">Montant</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="text-sm text-gray-500">Méthode de paiement</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMethodIcon(payment.method)}</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {payment.method}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="text-sm text-gray-500">Référence de transaction</div>
                  <div className="text-sm font-mono text-gray-900">
                    {payment.transactionReference}
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="text-sm text-gray-500">Date de création</div>
                  <div className="text-sm text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {payment.processedAt && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="text-sm text-gray-500">Date de traitement</div>
                    <div className="text-sm text-gray-900">
                      {new Date(payment.processedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <div className="text-sm text-gray-500">Statut</div>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Information */}
            {payment.loan && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations sur le Prêt
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Montant du prêt</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(payment.loan.amount)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Statut du prêt</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {payment.loan.status}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <button
                      onClick={() => router.push(`/loans/${payment.loanId}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir le prêt complet →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de l'emprunteur
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Nom</div>
                  <div className="font-semibold text-gray-900">{payment.user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm text-gray-900">{payment.user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Téléphone</div>
                  <div className="text-sm text-gray-900">{payment.user.phone}</div>
                </div>
                <div className="pt-3 border-t">
                  <button
                    onClick={() => router.push(`/drivers/${payment.userId}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir le profil complet →
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chronologie
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Paiement créé</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                {payment.processedAt && (
                  <div className="flex gap-3">
                    <div
                      className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-600'
                          : 'bg-red-600'
                      }`}
                    ></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Paiement {payment.status === 'COMPLETED' ? 'réussi' : 'échoué'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.processedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Process Payment Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Traiter le paiement</h2>
            <p className="text-sm text-gray-600 mb-4">
              Montant: <strong>{formatCurrency(payment.amount)}</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut du traitement
                </label>
                <select
                  value={processStatus}
                  onChange={(e) => setProcessStatus(e.target.value as 'SUCCESS' | 'FAILED')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SUCCESS">✅ Succès</option>
                  <option value="FAILED">❌ Échec</option>
                </select>
              </div>

              {processStatus === 'FAILED' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raisons courantes:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {failureTemplates.map((template) => (
                        <button
                          key={template}
                          onClick={() => setFailureReason(template)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison de l'échec:
                    </label>
                    <textarea
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      placeholder="Expliquer pourquoi le paiement a échoué..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowProcessModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleProcess}
                disabled={
                  processing ||
                  (processStatus === 'FAILED' && !failureReason.trim())
                }
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Rembourser le paiement
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette action remboursera <strong>{formatCurrency(payment.amount)}</strong> et
              ajustera le solde du prêt.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raisons courantes:
                </label>
                <div className="flex flex-wrap gap-2">
                  {refundTemplates.map((template) => (
                    <button
                      key={template}
                      onClick={() => setRefundReason(template)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du remboursement:
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Expliquer pourquoi ce paiement est remboursé..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRefundModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRefund}
                disabled={processing || !refundReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {processing ? 'Remboursement...' : 'Confirmer le remboursement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
