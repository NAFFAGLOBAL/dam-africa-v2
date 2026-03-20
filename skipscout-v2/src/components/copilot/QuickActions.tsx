'use client';

import { Button } from '@/components/ui/button';
import { Search, Users, Building2, Globe, CreditCard } from 'lucide-react';

const actions = [
  { label: 'Skip Trace a Person', icon: Search, prompt: 'I need to skip trace a person.' },
  { label: 'Build Lead List', icon: Users, prompt: 'I want to build a targeted lead list.' },
  { label: 'Property Lookup', icon: Building2, prompt: 'I want to look up property and mortgage data for an address.' },
  { label: 'Business Intel', icon: Globe, prompt: 'I want to look up business information.' },
  { label: 'My Credits', icon: CreditCard, prompt: 'How many credits do I have? Show my recent activity.' },
];

export function QuickActions({
  onSelect,
  disabled,
}: {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(action.prompt)}
          className="gap-1.5 text-xs"
        >
          <action.icon className="h-3.5 w-3.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
