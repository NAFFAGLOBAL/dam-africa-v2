'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw } from 'lucide-react';

interface ScoringFactor {
  id: string;
  label: string;
  description: string;
  weight: number;
  enabled: boolean;
}

const defaultFactors: ScoringFactor[] = [
  { id: 'payment_history', label: 'Historique de paiement', description: 'Ponctualit\u00e9 et r\u00e9gularit\u00e9 des paiements', weight: 35, enabled: true },
  { id: 'driving_behavior', label: 'Comportement de conduite', description: 'Respect du code de la route, vitesse, freinages', weight: 20, enabled: true },
  { id: 'vehicle_maintenance', label: 'Entretien du v\u00e9hicule', description: '\u00c9tat g\u00e9n\u00e9ral et maintenance pr\u00e9ventive', weight: 15, enabled: true },
  { id: 'kyc_completeness', label: 'Compl\u00e9tude KYC', description: 'Documents \u00e0 jour et conformit\u00e9', weight: 10, enabled: true },
  { id: 'revenue_generation', label: 'G\u00e9n\u00e9ration de revenus', description: 'Revenus mensuels g\u00e9n\u00e9r\u00e9s', weight: 10, enabled: true },
  { id: 'incident_history', label: 'Historique d\'incidents', description: 'Nombre et gravit\u00e9 des incidents', weight: 10, enabled: true },
];

const scoreThresholds = [
  { grade: 'A', min: 800, max: 1000, color: 'bg-emerald-500', label: 'Excellent' },
  { grade: 'B', min: 650, max: 799, color: 'bg-blue-500', label: 'Bon' },
  { grade: 'C', min: 500, max: 649, color: 'bg-yellow-500', label: 'Moyen' },
  { grade: 'D', min: 350, max: 499, color: 'bg-orange-500', label: 'Faible' },
  { grade: 'E', min: 0, max: 349, color: 'bg-red-500', label: 'Tr\u00e8s faible' },
];

export default function ScoringPage() {
  const [factors, setFactors] = useState(defaultFactors);

  const totalWeight = factors.filter((f) => f.enabled).reduce((sum, f) => sum + f.weight, 0);

  const updateWeight = (id: string, weight: number) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, weight: Math.max(0, Math.min(100, weight)) } : f))
    );
  };

  const toggleFactor = (id: string) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuration du scoring"
        description="Configurer les facteurs du score DAM"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFactors(defaultFactors)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              R\u00e9initialiser
            </Button>
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoring Factors */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Facteurs de scoring</CardTitle>
              <CardDescription>
                Ajustez le poids de chaque facteur. Le total doit \u00eatre de 100%.
                Actuellement: <span className={totalWeight === 100 ? 'text-emerald-500 font-semibold' : 'text-destructive font-semibold'}>{totalWeight}%</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {factors.map((factor) => (
                <div key={factor.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={factor.enabled}
                          onCheckedChange={() => toggleFactor(factor.id)}
                        />
                        <div>
                          <p className="text-sm font-medium">{factor.label}</p>
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        value={factor.weight}
                        onChange={(e) => updateWeight(factor.id, parseInt(e.target.value) || 0)}
                        disabled={!factor.enabled}
                        className="w-20 text-center"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  {factor.enabled && (
                    <div className="ml-12 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${factor.weight}%` }}
                      />
                    </div>
                  )}
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview & Thresholds */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aper\u00e7u du score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ScoreGauge score={750} size={180} strokeWidth={14} />
              <p className="text-sm text-muted-foreground mt-4">Exemple: Score 750/1000</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seuils de notation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scoreThresholds.map((threshold) => (
                <div key={threshold.grade} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg ${threshold.color} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">{threshold.grade}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{threshold.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {threshold.min} - {threshold.max} points
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
