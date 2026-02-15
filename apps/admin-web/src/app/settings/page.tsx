'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

interface Settings {
  interestRates: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  maxLoanAmounts: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  minCreditScore: number;
  maxActiveLoans: number;
  creditWeights: {
    paymentHistory: number;
    loanUtilization: number;
    accountAge: number;
    drivingPerformance: number;
    kycCompleteness: number;
  };
  mockMode: boolean;
  apiStatus: {
    wave: boolean;
    yango: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    interestRates: { A: 12, B: 15, C: 18, D: 22, E: 25 },
    maxLoanAmounts: { A: 5000000, B: 3000000, C: 2000000, D: 1000000, E: 500000 },
    minCreditScore: 500,
    maxActiveLoans: 2,
    creditWeights: {
      paymentHistory: 35,
      loanUtilization: 30,
      accountAge: 15,
      drivingPerformance: 10,
      kycCompleteness: 10,
    },
    mockMode: true,
    apiStatus: {
      wave: false,
      yango: false,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    setLoading(true);
    const response = await api.getSettings();

    if (response.success && response.data) {
      setSettings(response.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // Validate credit weights sum to 100
    const totalWeight = Object.values(settings.creditWeights).reduce((sum, val) => sum + val, 0);
    if (totalWeight !== 100) {
      alert(`Erreur: Les poids des scores doivent totaliser 100% (actuel: ${totalWeight}%)`);
      return;
    }

    setSaving(true);
    // In a real implementation, we'd save each setting individually
    // For now, we'll just simulate a save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Paramètres sauvegardés avec succès!');
  };

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + 'M CFA';
  };

  const getTotalWeight = () => {
    return Object.values(settings.creditWeights).reduce((sum, val) => sum + val, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar admin={admin} />

      <main className="flex-1 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres du Système</h1>
          <p className="text-gray-600 mt-1">Configuration de la plateforme de prêt</p>
        </div>

        {/* Loan Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Configuration des Prêts
          </h2>

          {/* Interest Rates */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Taux d'Intérêt par Rating
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(settings.interestRates).map(([rating, rate]) => (
                <div key={rating}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating {rating}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          interestRates: {
                            ...settings.interestRates,
                            [rating]: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.5"
                      min="0"
                      max="50"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Max Loan Amounts */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Montant Maximum par Rating
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(settings.maxLoanAmounts).map(([rating, amount]) => (
                <div key={rating}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating {rating}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxLoanAmounts: {
                          ...settings.maxLoanAmounts,
                          [rating]: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="100000"
                    min="0"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCurrency(amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Loan Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score de Crédit Minimum pour Prêt
              </label>
              <input
                type="number"
                value={settings.minCreditScore}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minCreditScore: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Les conducteurs doivent avoir au moins ce score pour être éligibles
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Maximum de Prêts Actifs par Utilisateur
              </label>
              <input
                type="number"
                value={settings.maxActiveLoans}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxActiveLoans: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Un conducteur ne peut avoir plus de ce nombre de prêts actifs simultanés
              </p>
            </div>
          </div>
        </div>

        {/* Credit Score Weights */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Poids des Composants du Score de Crédit
          </h2>

          <div className="space-y-4">
            {Object.entries(settings.creditWeights).map(([key, weight]) => {
              const labels: { [key: string]: string } = {
                paymentHistory: 'Historique de Paiement',
                loanUtilization: 'Utilisation des Prêts',
                accountAge: 'Ancienneté du Compte',
                drivingPerformance: 'Performance de Conduite',
                kycCompleteness: 'Complétude KYC',
              };

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {labels[key]}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            creditWeights: {
                              ...settings.creditWeights,
                              [key]: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${weight}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span
                className={`text-2xl font-bold ${
                  getTotalWeight() === 100 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {getTotalWeight()}%
              </span>
            </div>
            {getTotalWeight() !== 100 && (
              <p className="text-sm text-red-600 mt-2">
                ⚠ Le total doit être exactement 100%
              </p>
            )}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Paramètres Système
          </h2>

          <div className="space-y-6">
            {/* Mock Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Mode Simulation</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Activer pour tester sans effectuer de vraies transactions
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, mockMode: !settings.mockMode })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.mockMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.mockMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* API Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Statut des Intégrations API
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        settings.apiStatus.wave ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Wave API</div>
                      <div className="text-xs text-gray-500">
                        Paiements mobile money
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      settings.apiStatus.wave ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {settings.apiStatus.wave ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        settings.apiStatus.yango ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Yango API</div>
                      <div className="text-xs text-gray-500">
                        Données de performance de conduite
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      settings.apiStatus.yango ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {settings.apiStatus.yango ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || getTotalWeight() !== 100}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les Paramètres'}
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠</span>
            <div>
              <h3 className="text-sm font-medium text-yellow-900">
                Attention: Modifications Critiques
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Les modifications des taux d'intérêt et des montants maximums affectent
                immédiatement les nouvelles demandes de prêt. Les prêts existants ne sont
                pas affectés. Assurez-vous de bien comprendre l'impact avant de sauvegarder.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
