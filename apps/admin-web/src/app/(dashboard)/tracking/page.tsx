'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Car, Navigation, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockVehicles = [
  { id: '1', name: 'Toyota Hilux', plate: 'AB-1234-CD', driver: 'Kouam\u00e9 Jean', status: 'moving', speed: 45, location: 'Cocody, Abidjan', lastUpdate: '2 min' },
  { id: '2', name: 'Hyundai Tucson', plate: 'IJ-9012-KL', driver: 'Traor\u00e9 Fatou', status: 'stopped', speed: 0, location: 'Plateau, Abidjan', lastUpdate: '15 min' },
  { id: '3', name: 'Nissan Patrol', plate: 'UV-1234-WX', driver: 'Yao Koffi', status: 'moving', speed: 62, location: 'Marcory, Abidjan', lastUpdate: '1 min' },
  { id: '4', name: 'Toyota Corolla', plate: 'EF-5678-GH', driver: 'N/A', status: 'offline', speed: 0, location: 'Derni\u00e8re pos.: Yopougon', lastUpdate: '3h' },
  { id: '5', name: 'Renault Duster', plate: 'CD-9012-EF', driver: 'Kone Aminata', status: 'moving', speed: 28, location: 'Adjam\u00e9, Abidjan', lastUpdate: '30 sec' },
];

const statusColors: Record<string, { color: string; label: string }> = {
  moving: { color: 'bg-emerald-500', label: 'En mouvement' },
  stopped: { color: 'bg-amber-500', label: 'Arr\u00eat\u00e9' },
  offline: { color: 'bg-gray-400', label: 'Hors ligne' },
};

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Suivi GPS"
        description="Localisation en temps r\u00e9el de votre flotte"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg flex flex-col items-center justify-center gap-4">
              <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Carte de suivi GPS</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Int\u00e9gration Google Maps / Mapbox
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                {Object.entries(statusColors).map(([key, { color, label }]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle list */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un v\u00e9hicule..." className="pl-9" />
          </div>

          <div className="space-y-2">
            {mockVehicles.map((vehicle) => {
              const status = statusColors[vehicle.status];
              return (
                <Card key={vehicle.id} className="card-hover cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', status.color)} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{vehicle.name}</p>
                          {vehicle.speed > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {vehicle.speed} km/h
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{vehicle.plate}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Navigation className="h-3 w-3" />
                          <span className="truncate">{vehicle.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {vehicle.driver}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {vehicle.lastUpdate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
