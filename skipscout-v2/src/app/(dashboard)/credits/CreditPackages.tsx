'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export function CreditPackages({ packages }: { packages: Package[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (pkg: Package) => {
    setLoadingId(pkg.id);
    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Credit packages coming soon. Contact support@skipscout.com for credits.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{pkg.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">${pkg.price}</p>
              <p className="text-sm text-muted-foreground">
                {pkg.credits.toLocaleString()} credits
              </p>
              <p className="text-xs text-muted-foreground">
                ${(pkg.price / pkg.credits).toFixed(4)} per credit
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => handlePurchase(pkg)}
              disabled={loadingId === pkg.id}
            >
              {loadingId === pkg.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Purchase'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
