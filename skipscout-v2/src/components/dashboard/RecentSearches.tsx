'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchItem {
  id: string;
  type: string;
  query: Record<string, unknown>;
  status: string;
  credits: number;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  versium_contact_append: 'Skip Trace',
  versium_demographic_append: 'Property Lookup',
  versium_firmographic_append: 'Business Intel',
  versium_b2c_estimate: 'B2C Estimate',
  versium_b2b_estimate: 'B2B Estimate',
  versium_ip_domain: 'IP Lookup',
};

export function RecentSearches({ searches }: { searches: SearchItem[] }) {
  if (searches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No searches yet. Try the AI Copilot to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[search.type] || search.type}
                </Badge>
                <span className="text-sm text-slate-600">
                  {JSON.stringify(search.query).substring(0, 60)}...
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(search.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
