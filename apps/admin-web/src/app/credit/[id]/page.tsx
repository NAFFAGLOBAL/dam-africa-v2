'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

interface CreditScoreDetail {
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  score: number;
  rating: string;
  components: {
    paymentHistory: number;
    loanUtilization: number;
    accountAge: number;
    drivingPerformance: number;
    kycCompleteness: number;
  };
  maxLoanAmount: number;
  interestRate: number;
  updatedAt: string;
}

interface ScoreHistory {
  id: string;
  oldScore: number;
  newScore: number;
  oldRating: string;
  newRating: string;
  reason: string;
  createdAt: string;
}

export default function CreditScoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [admin, setAdmin] = useState<any>(null);
  const [scoreDetail, setScoreDetail] = useState<CreditScoreDetail | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchCreditScoreDetail();
    fetchScoreHistory();
  }, [userId, router]);

  const fetchCreditScoreDetail = async () => {
    setLoading(true);
    const response = await api.getCreditScore(userId);

    if (response.success && response.data) {
      setScoreDetail(response.data);
    }
    setLoading(false);
  };

  const fetchScoreHistory = async () => {
    const response = await api.getCreditScoreHistory(userId);

    if (response.success && response.data) {
      setHistory(response.data.history || []);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    const response = await api.recalculateCreditScore(userId);

    if (response.success) {
      await fetchCreditScoreDetail();
      await fetchScoreHistory();
    }
    setRecalculating(false);
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

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 700) return 'text-blue-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!scoreDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Score non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar admin={admin} />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/credit')}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
            >
              ← Retour aux scores
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{scoreDetail.user.name}</h1>
            <p className="text-gray-600 mt-1">{scoreDetail.user.email}</p>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recalculating ? 'Recalcul...' : 'Recalculer le Score'}
          </button>
        </div>

        {/* Score Gauge */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-6">
                {/* Circular Score Gauge */}
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={
                        scoreDetail.score >= 800 ? '#16a34a' :
                        scoreDetail.score >= 700 ? '#2563eb' :
                        scoreDetail.score >= 600 ? '#ca8a04' :
                        scoreDetail.score >= 500 ? '#ea580c' : '#dc2626'
                      }
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${(scoreDetail.score / 1000) * 553} 553`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-5xl font-bold ${getScoreColor(scoreDetail.score)}`}>
                      {scoreDetail.score}
                    </div>
                    <div className="text-gray-500 text-sm">sur 1000</div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Rating</div>
                    <span
                      className={`inline-flex px-6 py-3 text-4xl font-bold rounded-lg border-2 ${getRatingColor(
                        scoreDetail.rating
                      )}`}
                    >
                      {scoreDetail.rating}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Dernière mise à jour:{' '}
                    {new Date(scoreDetail.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Eligibility */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Éligibilité au Prêt</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Montant maximum</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(scoreDetail.maxLoanAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Taux d'intérêt</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {scoreDetail.interestRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Analyse des Composants</h2>

          <div className="space-y-4">
            {/* Payment History */}
            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">Historique de Paiement</span>
                  <span className="text-sm text-gray-500 ml-2">(35%)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {scoreDetail.components.paymentHistory}/350
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(scoreDetail.components.paymentHistory / 350) * 100}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round((scoreDetail.components.paymentHistory / 350) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Utilization */}
            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">Utilisation des Prêts</span>
                  <span className="text-sm text-gray-500 ml-2">(30%)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {scoreDetail.components.loanUtilization}/300
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(scoreDetail.components.loanUtilization / 300) * 100}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round((scoreDetail.components.loanUtilization / 300) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Account Age */}
            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">Ancienneté du Compte</span>
                  <span className="text-sm text-gray-500 ml-2">(15%)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {scoreDetail.components.accountAge}/150
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-600 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(scoreDetail.components.accountAge / 150) * 100}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round((scoreDetail.components.accountAge / 150) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Driving Performance */}
            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">Performance de Conduite</span>
                  <span className="text-sm text-gray-500 ml-2">(10%)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {scoreDetail.components.drivingPerformance}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-yellow-600 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(scoreDetail.components.drivingPerformance / 100) * 100}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round((scoreDetail.components.drivingPerformance / 100) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* KYC Completeness */}
            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">Complétude KYC</span>
                  <span className="text-sm text-gray-500 ml-2">(10%)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {scoreDetail.components.kycCompleteness}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(scoreDetail.components.kycCompleteness / 100) * 100}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round((scoreDetail.components.kycCompleteness / 100) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Historique des Scores</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Aucun historique disponible
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{record.oldScore}</span>
                          <span className="text-gray-400">→</span>
                          <span className={`text-sm font-bold ${getScoreColor(record.newScore)}`}>
                            {record.newScore}
                          </span>
                          <span
                            className={`text-sm ${
                              record.newScore > record.oldScore
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            ({record.newScore > record.oldScore ? '+' : ''}
                            {record.newScore - record.oldScore})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getRatingColor(record.oldRating).split(' ')[0]}`}>
                            {record.oldRating}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`font-bold ${getRatingColor(record.newRating).split(' ')[0]}`}>
                            {record.newRating}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
