'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

interface VehicleDetail {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  status: string;
  purchasePrice: number;
  currentValue: number;
  currentRental?: {
    id: string;
    userId: string;
    user: {
      name: string;
      email: string;
    };
    startDate: string;
    weeklyRate: number;
  };
  rentalHistory: Array<{
    id: string;
    user: {
      name: string;
    };
    startDate: string;
    endDate?: string;
    weeklyRate: number;
    totalPaid: number;
  }>;
}

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const [admin, setAdmin] = useState<any>(null);
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('admin');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchVehicleDetail();
  }, [vehicleId, router]);

  const fetchVehicleDetail = async () => {
    setLoading(true);
    const response = await api.getVehicle(vehicleId);

    if (response.success && response.data) {
      setVehicle(response.data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RENTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RETIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      AVAILABLE: 'Disponible',
      RENTED: 'En location',
      MAINTENANCE: 'En maintenance',
      RETIRED: 'Retiré',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
  };

  const handleAssign = () => {
    alert('Fonctionnalité "Assigner" à venir - Modal de sélection du conducteur');
  };

  const handleReturn = () => {
    if (vehicle?.currentRental) {
      alert('Fonctionnalité "Retirer" à venir - Retour du véhicule');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Véhicule non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar admin={admin} />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/vehicles')}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            ← Retour aux véhicules
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h1>
              <p className="text-gray-600 mt-1 font-mono font-bold">{vehicle.licensePlate}</p>
            </div>
            <span
              className={`inline-flex px-4 py-2 text-lg font-semibold rounded-lg border-2 ${getStatusColor(
                vehicle.status
              )}`}
            >
              {getStatusLabel(vehicle.status)}
            </span>
          </div>
        </div>

        {/* Vehicle Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Photo Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <span className="text-6xl">🚗</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">VIN</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.vin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Couleur</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.color}</span>
              </div>
            </div>
          </div>

          {/* Value Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Valeur</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Prix d'achat</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(vehicle.purchasePrice)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Valeur actuelle</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(vehicle.currentValue)}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Dépréciation</div>
                <div className="text-lg font-semibold text-red-600">
                  -{formatCurrency(vehicle.purchasePrice - vehicle.currentValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Current Rental Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Actuelle</h3>
            {vehicle.currentRental ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Conducteur</div>
                  <div className="text-lg font-medium text-gray-900">
                    {vehicle.currentRental.user.name}
                  </div>
                  <div className="text-sm text-gray-500">{vehicle.currentRental.user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Date de début</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(vehicle.currentRental.startDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tarif hebdomadaire</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(vehicle.currentRental.weeklyRate)}
                  </div>
                </div>
                <button
                  onClick={handleReturn}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retourner le Véhicule
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">Aucune location en cours</p>
                {vehicle.status === 'AVAILABLE' && (
                  <button
                    onClick={handleAssign}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Assigner à un Conducteur
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rental History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Historique des Locations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conducteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarif Hebdo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Payé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicle.rentalHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun historique de location
                    </td>
                  </tr>
                ) : (
                  vehicle.rentalHistory.map((rental) => (
                    <tr key={rental.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rental.user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(rental.startDate).toLocaleDateString('fr-FR')}
                        {rental.endDate ? (
                          <> → {new Date(rental.endDate).toLocaleDateString('fr-FR')}</>
                        ) : (
                          <span className="text-blue-600 font-medium"> (En cours)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(rental.weeklyRate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(rental.totalPaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rental.endDate ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Terminé
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Actif
                          </span>
                        )}
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
