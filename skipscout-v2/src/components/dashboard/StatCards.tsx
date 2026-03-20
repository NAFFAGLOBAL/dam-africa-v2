'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Building2, CreditCard } from 'lucide-react';

interface StatCardsProps {
  stats: {
    totalSearches: number;
    creditsUsed: number;
    creditsRemaining: number;
    listsBuilt: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    { title: 'Total Searches', value: stats.totalSearches, icon: Search, color: 'text-blue-600' },
    { title: 'Credits Used', value: stats.creditsUsed, icon: CreditCard, color: 'text-orange-600' },
    { title: 'Credits Remaining', value: stats.creditsRemaining, icon: CreditCard, color: 'text-green-600' },
    { title: 'Lists Built', value: stats.listsBuilt, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
