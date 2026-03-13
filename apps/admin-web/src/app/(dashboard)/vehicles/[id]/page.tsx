'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Fuel, Calendar, MapPin, Gauge, Wrench, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockVehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Hilux',
  year: 2023,
  plate: 'AB-1234-CD',
  vin: 'JTFSS22P8D0123456',
  color: 'Blanc',
  fuelType: 'Diesel',
  transmission: 'Automatique',
  status: 'RENTED',
  dailyRate: 35000,
  mileage: 12500,
  gpsActive: true,
  purchaseDate: '2023-06-15',
  purchasePrice: 18500000,
  insuranceExpiry: '2025-06-15',
  currentDriver: { name: 'Kouam\u00e9 Jean', phone: '+2250102030405' },
  maintenanceHistory: [
    { id: 'M1', type: 'Vidange', date: '2024-06-01', cost: 45000 },
    { id: 'M2', type: 'Pneus', date: '2024-03-15', cost: 180000 },
    { id: 'M3', type: 'R\u00e9vision g\u00e9n\u00e9rale', date: '2024-01-10', cost: 120000 },
  ],
};

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicle = mockVehicle;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${vehicle.make} ${vehicle.model}`}
        breadcrumbs={[
          { label: 'V\u00e9hicules', href: '/vehicles' },
          { label: `${vehicle.make} ${vehicle.model}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Wrench className="mr-2 h-4 w-4" />
              Maintenance
            </Button>
            <Button size="sm">Modifier</Button>
          </div>
        }
      />

      {/* Vehicle Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-48 w-full md:w-72 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0">
              <Car className="h-20 w-20 text-muted-foreground/30" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </h2>
                <StatusBadge status={vehicle.status} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Plaque', value: vehicle.plate, icon: Car },
                  { label: 'Carburant', value: vehicle.fuelType, icon: Fuel },
                  { label: 'Kilom\u00e9trage', value: `${vehicle.mileage.toLocaleString('fr-FR')} km`, icon: Gauge },
                  { label: 'Tarif journalier', value: formatCurrency(vehicle.dailyRate), icon: Calendar },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
              {vehicle.currentDriver && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Conducteur actuel: <strong>{vehicle.currentDriver.name}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">D\u00e9tails</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sp\u00e9cifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'VIN', value: vehicle.vin },
                  { label: 'Couleur', value: vehicle.color },
                  { label: 'Transmission', value: vehicle.transmission },
                  { label: 'Date d\'achat', value: formatDate(vehicle.purchaseDate) },
                  { label: 'Prix d\'achat', value: formatCurrency(vehicle.purchasePrice) },
                  { label: 'Assurance expire', value: formatDate(vehicle.insuranceExpiry) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">GPS & Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground ml-2">
                    Carte de localisation
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardContent className="p-0 divide-y">
              {vehicle.maintenanceHistory.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.type}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(m.date)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(m.cost)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
