'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function KYCReviewPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [imageZoom, setImageZoom] = useState<'front' | 'back' | null>(null);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const fetchDocument = async () => {
    setLoading(true);
    const response = await api.getKYCDocument(documentId);
    if (response.success && response.data) {
      setDocument(response.data);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!confirm('Êtes-vous sûr de vouloir approuver ce document?')) return;

    setProcessing(true);
    const response = await api.approveKYC(documentId, approvalNotes || undefined);
    
    if (response.success) {
      alert('✅ Document approuvé avec succès!');
      router.push('/kyc');
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
    const response = await api.rejectKYC(documentId, rejectionReason);
    
    if (response.success) {
      alert('✅ Document rejeté avec succès!');
      setShowRejectModal(false);
      router.push('/kyc');
    } else {
      alert('❌ Erreur lors du rejet');
    }
    setProcessing(false);
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

  const rejectionTemplates = [
    'Document flou ou illisible',
    'Document expiré',
    'Information non visible',
    'Photo de mauvaise qualité',
    'Document incomplet',
    'Ne correspond pas au type demandé',
    'Suspicion de falsification',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Document non trouvé</div>
      </div>
    );
  }

  const canReview = document.status === 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/kyc')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour à la file
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Révision KYC - {document.user.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {getDocumentTypeLabel(document.documentType)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {canReview && (
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Document Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            {document.status !== 'PENDING' && (
              <div
                className={`rounded-lg p-4 ${
                  document.status === 'APPROVED'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {document.status === 'APPROVED' ? '✅' : '❌'}
                  </span>
                  <div>
                    <div
                      className={`font-semibold ${
                        document.status === 'APPROVED'
                          ? 'text-green-900'
                          : 'text-red-900'
                      }`}
                    >
                      Document {document.status === 'APPROVED' ? 'approuvé' : 'rejeté'}
                    </div>
                    {document.reviewedAt && (
                      <div className="text-sm text-gray-600">
                        Le {new Date(document.reviewedAt).toLocaleDateString('fr-FR')}
                        {document.reviewedBy && ` par ${document.reviewedBy.name}`}
                      </div>
                    )}
                    {document.rejectionReason && (
                      <div className="text-sm text-red-700 mt-1">
                        Raison: {document.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Images du document
              </h2>

              {/* Front Image */}
              {document.frontImageUrl && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Recto</h3>
                    <button
                      onClick={() => setImageZoom('front')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      🔍 Agrandir
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={document.frontImageUrl}
                      alt="Document recto"
                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setImageZoom('front')}
                    />
                  </div>
                </div>
              )}

              {/* Back Image */}
              {document.backImageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Verso</h3>
                    <button
                      onClick={() => setImageZoom('back')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      🔍 Agrandir
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={document.backImageUrl}
                      alt="Document verso"
                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setImageZoom('back')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Approval Notes (if reviewing) */}
            {canReview && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Notes d'approbation (optionnel)
                </h2>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Ajouter des notes internes sur ce document..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Sidebar - Document Info */}
          <div className="space-y-6">
            {/* Driver Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations du conducteur
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Nom complet</div>
                  <div className="text-sm text-gray-900 font-semibold">
                    {document.user.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-sm text-gray-900">{document.user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Téléphone</div>
                  <div className="text-sm text-gray-900">{document.user.phone}</div>
                </div>
                <div className="pt-3 border-t">
                  <button
                    onClick={() => router.push(`/drivers/${document.userId}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir le profil complet →
                  </button>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails du document
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <div className="text-sm text-gray-900 font-semibold">
                    {getDocumentTypeLabel(document.documentType)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Numéro</div>
                  <div className="text-sm text-gray-900">
                    {document.documentNumber || 'Non fourni'}
                  </div>
                </div>
                {document.expiryDate && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Date d'expiration</div>
                    <div className="text-sm text-gray-900">
                      {new Date(document.expiryDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500">Soumis le</div>
                  <div className="text-sm text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Statut</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        document.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : document.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {document.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            {canReview && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  ✓ Liste de vérification
                </h2>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Le document est lisible et de bonne qualité</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Les informations correspondent au conducteur</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Le document n'est pas expiré</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Aucun signe de falsification</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>☑</span>
                    <span>Le type de document correspond</span>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Rejeter le document
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet. Le conducteur recevra cette information.
            </p>

            {/* Quick Templates */}
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

            {/* Custom Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquer pourquoi ce document est rejeté..."
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

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setImageZoom(null)}
        >
          <div className="max-w-5xl w-full">
            <img
              src={
                imageZoom === 'front'
                  ? document.frontImageUrl
                  : document.backImageUrl
              }
              alt={`Document ${imageZoom === 'front' ? 'recto' : 'verso'}`}
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setImageZoom(null)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
