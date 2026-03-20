'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';

export function CreditBalance() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/credits/balance')
      .then((r) => r.json())
      .then((d) => setCredits(d.credits))
      .catch(() => setCredits(0));
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
      <CreditCard className="h-4 w-4" />
      <span>{credits !== null ? `${credits.toLocaleString()} credits` : '...'}</span>
    </div>
  );
}
