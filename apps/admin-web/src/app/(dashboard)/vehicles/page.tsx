'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, LayoutGrid, List, Car, Fuel, MapPin } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  status: string;
  fuelType: string;
  dailyRate: number;
  mileage: number;
  driverName?: string;
  gpsActive: boolean;
}

const mockVehicles: Vehicle[] = [
  { id: '1', make: 'Toyota', model: 'Hilux', year: 2023, plate: 'AB-1234-CD', status: 'RENTED', fuelType: 'Diesel', dailyRate: 35000, mileage: 12500, driverName: 'Kouam\u00e9 Jean', gpsActive: true },
  { id: '2', make: 'Toyota', model: 'Corolla', year: 2022, plate: 'EF-5678-GH', status: 'AVAILABLE', fuelType: 'Essence', dailyRate: 25000, mileage: 28000, gpsActive: true },
  { id: '3', make: 'Hyundai', model: 'Tucson', year: 2023, plate: 'IJ-9012-KL', status: 'RENTED', fuelType: 'Essence', dailyRate: 30000, mileage: 8700, driverName: 'Traor\u00e9 Fatou', gpsActive: true },
  { id: '4', make: 'Suzuki', model: 'Swift', year: 2021, plate: 'MN-3456-OP', status: 'MAINTENANCE', fuelType: 'Essence', dailyRate: 20000, mileage: 45000, gpsActive: false },
  { id: '5', make: 'Toyota', model: 'RAV4', year: 2024, plate: 'QR-7890-ST', status: 'AVAILABLE', fuelType: 'Hybride', dailyRate: 40000, mileage: 3200, gpsActive: true },
  { id: '6', make: 'Nissan', model: 'Patrol', year: 2023, plate: 'UV-1234-WX', status: 'RENTED', fuelType: 'Diesel', dailyRate: 50000, mileage: 15800, driverName: 'Yao Koffi', gpsActive: true },
  { id: '7', make: 'Peugeot', model: '308', year: 2022, plate: 'YZ-5678-AB', status: 'RETIRED', fuelType: 'Essence', dailyRate: 0, mileage: 95000, gpsActive: false },
  { id: '8', make: 'Renault', model: 'Duster', year: 2023, plate: 'CD-9012-EF', status: 'AVAILABLE', fuelType: 'Diesel', dailyRate: 28000, mileage: 11200, gpsActive: true },
];

export default function VehiclesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredVehicles = mockVehicles.filter((v) => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesSearch =
      !search ||
      `${v.make} ${v.model} ${v.plate}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="V\u00e9hicules"
        description="G\u00e9rer votre flotte de v\u00e9hicules"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un v\u00e9hicule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="AVAILABLE">Disponible</SelectItem>
            <SelectItem value="RENTED">Lou\u00e9</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="RETIRED">Retir\u00e9</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 ml-auto">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vehicle Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="card-hover cursor-pointer overflow-hidden"
              onClick={() => router.push(`/vehicles/${vehicle.id}`)}
            >
              <div className="h-36 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Car className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                  </div>
                  <StatusBadge status={vehicle.status} showDot={false} />
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {vehicle.plate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel className="h-3.5 w-3.5" />
                    <span className="text-xs">{vehicle.fuelType}</span>
                    <span className="text-xs ml-auto">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
                  </div>
                  {vehicle.driverName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs">{vehicle.driverName}</span>
                    </div>
                  )}
                </div>
                {vehicle.dailyRate > 0 && (
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(vehicle.dailyRate)}/jour
                  </p>
                )}
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      vehicle.gpsActive ? 'bg-emerald-500' : 'bg-gray-400'
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    GPS {vehicle.gpsActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/vehicles/${vehicle.id}`)}
              >
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Car className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.plate} - {vehicle.fuelType} - {vehicle.mileage.toLocaleString('fr-FR')} km
                  </p>
                </div>
                {vehicle.driverName && (
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {vehicle.driverName}
                  </span>
                )}
                {vehicle.dailyRate > 0 && (
                  <span className="text-sm font-semibold hidden sm:block">
                    {formatCurrency(vehicle.dailyRate)}/j
                  </span>
                )}
                <StatusBadge status={vehicle.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
