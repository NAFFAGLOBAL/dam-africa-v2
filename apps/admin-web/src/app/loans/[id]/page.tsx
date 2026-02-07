'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id as string;

  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [disbursementData, setDisbursementData] = useState({
    method: 'MOBILE_MONEY',
    phoneNumber: '',
  });

  useEffect(() => {
    if (loanId) {
      fetchLoan();
    }
  }, [loanId]);

  const fetchLoan = async () => {
    setLoading(true);
    const response = await api.getLoan(loanId);
    if (response.success && response.data) {
      setLoan(response.data);
      setDisbursementData({
        ...disbursementData,
        phoneNumber: response.data.user.phone,
      });
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!confirm('Êtes-vous sûr de vouloir approuver ce prêt?')) return;

    setProcessing(true);
    const response = await api.approveLoan(loanId, approvalNotes || undefined);

    if (response.success) {
      alert('✅ Prêt approuvé avec succès!');
      fetchLoan();
    } else {
      alert('❌ Erreur lors de l\'approbation');
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }

    setProcessing(true);
    const response = await api.rejectLoan(loanId, rejectionReason);

    if (response.success) {
      alert('✅ Prêt rejeté avec succès!');
      setShowRejectModal(false);
      router.push('/loans');
    } else {
      alert('❌ Erreur lors du rejet');
    }
    setProcessing(false);
  };

  const handleDisburse = async () => {
    if (!disbursementData.phoneNumber) {
      alert('Veuillez indiquer le numéro de téléphone');
      return;
    }

    setProcessing(true);
    const response = await api.disburseLoan(loanId, disbursementData);

    if (response.success) {
      alert('✅ Prêt décaissé avec succès!');
      setShowDisburseModal(false);
      fetchLoan();
    } else {
      alert('❌ Erreur lors du décaissement');
    }
    setProcessing(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
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

  const rejectionTemplates = [
    'Score de crédit insuffisant',
    'Ratio d\'endettement trop élevé',
    'Historique de paiement problématique',
    'Vérification KYC incomplète',
    'Montant demandé trop élevé pour le profil',
    'Documents manquants ou invalides',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Prêt non trouvé</div>
      </div>
    );
  }

  const canApprove = loan.status === 'PENDING';
  const canDisburse = loan.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/loans')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Demande de Prêt - {loan.user.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatCurrency(loan.amount)} sur {loan.termWeeks} semaines
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {canApprove && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    ✗ Rejeter
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Approuver
                  </button>
                </>
              )}
              {canDisburse && (
                <button
                  onClick={() => setShowDisburseModal(true)}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  💰 Décaisser
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
            {loan.status !== 'PENDING' && (
              <div
                className={`rounded-lg p-4 border ${
                  loan.status === 'APPROVED'
                    ? 'bg-green-50 border-green-200'
                    : loan.status === 'ACTIVE'
                    ? 'bg-blue-50 border-blue-200'
                    : loan.status === 'COMPLETED'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {loan.status === 'APPROVED' && '✅'}
                    {loan.status === 'ACTIVE' && '💰'}
                    {loan.status === 'COMPLETED' && '🎉'}
                    {loan.status === 'REJECTED' && '❌'}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Statut: {loan.status}
                    </div>
                    {loan.disbursedAt && (
                      <div className="text-sm text-gray-600">
                        Décaissé le {new Date(loan.disbursedAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {loan.rejectionReason && (
                      <div className="text-sm text-red-700 mt-1">
                        Raison du rejet: {loan.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loan Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Résumé du Prêt
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Montant demandé</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(loan.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Montant total à rembourser</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(loan.totalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Durée</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {loan.termWeeks} semaines
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Taux d'intérêt</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {loan.interestRate}% par an
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Paiement hebdomadaire</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(loan.weeklyPayment)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Objectif</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {loan.purpose}
                  </div>
                </div>
              </div>

              {loan.status === 'ACTIVE' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Solde restant</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(loan.remainingBalance)}
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((loan.amount - loan.remainingBalance) / loan.amount) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {Math.round(
                      ((loan.amount - loan.remainingBalance) / loan.amount) * 100
                    )}
                    % remboursé
                  </div>
                </div>
              )}
            </div>

            {/* Payment Schedule */}
            {loan.paymentSchedule && loan.paymentSchedule.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Calendrier de Remboursement
                </h2>
                <div className="space-y-2">
                  {loan.paymentSchedule.slice(0, 5).map((payment: any, index: number) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          Semaine {payment.weekNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-500">{payment.status}</div>
                      </div>
                    </div>
                  ))}
                  {loan.paymentSchedule.length > 5 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ... et {loan.paymentSchedule.length - 5} autres paiements
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Notes */}
            {canApprove && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Notes d'approbation (optionnel)
                </h2>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Ajouter des notes internes sur cette approbation..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Borrower Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Emprunteur
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Nom</div>
                  <div className="font-semibold text-gray-900">{loan.user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm text-gray-900">{loan.user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Téléphone</div>
                  <div className="text-sm text-gray-900">{loan.user.phone}</div>
                </div>
                <div className="pt-3 border-t">
                  <button
                    onClick={() => router.push(`/drivers/${loan.userId}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir le profil complet →
                  </button>
                </div>
              </div>
            </div>

            {/* Credit Assessment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Évaluation de Crédit
              </h2>
              <div className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <div className="text-sm text-gray-500 mb-1">Note de Crédit</div>
                  <div className={`text-4xl font-bold ${getCreditRatingColor(loan.user.creditRating)}`}>
                    {loan.user.creditRating}
                  </div>
                  <div className="text-lg text-gray-600">{loan.user.creditScore}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Statut KYC</div>
                  <div className="font-semibold text-gray-900">{loan.user.kycStatus}</div>
                </div>
                {loan.user.activeLoans !== undefined && (
                  <div>
                    <div className="text-sm text-gray-500">Prêts actifs</div>
                    <div className="font-semibold text-gray-900">
                      {loan.user.activeLoans}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Checklist */}
            {canApprove && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  ✓ Points de Vérification
                </h2>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Score de crédit ≥ 350 requis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>KYC vérifié</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Pas de prêt en défaut</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Montant dans la limite autorisée</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Capacité de remboursement</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejeter la demande</h2>
            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet. L'emprunteur recevra cette information.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raisons courantes:
              </label>
              <div className="flex flex-wrap gap-2">
                {rejectionTemplates.map((template) => (
                  <button
                    key={template}
                    onClick={() => setRejectionReason(template)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquer pourquoi cette demande est rejetée..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Décaisser le prêt</h2>
            <p className="text-sm text-gray-600 mb-4">
              Montant à décaisser: <strong>{formatCurrency(loan.amount)}</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de décaissement
                </label>
                <select
                  value={disbursementData.method}
                  onChange={(e) =>
                    setDisbursementData({ ...disbursementData, method: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                </select>
              </div>

              {disbursementData.method === 'MOBILE_MONEY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={disbursementData.phoneNumber}
                    onChange={(e) =>
                      setDisbursementData({
                        ...disbursementData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+225 07 12 34 56 78"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDisburseModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDisburse}
                disabled={processing || !disbursementData.phoneNumber}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Décaissement...' : 'Confirmer le décaissement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
