'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SkipTracePage() {
  const [form, setForm] = useState({
    first: '',
    last: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Skip trace this person: ${form.first} ${form.last}, ${form.address}, ${form.city}, ${form.state} ${form.zip}`,
          history: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Skip Trace</h1>
        <p className="text-sm text-slate-500">
          Find current contact information for a person. 3 credits per lookup.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Person Information</CardTitle>
          <CardDescription>
            Provide as much info as possible for best results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="First Name" value={form.first} onChange={update('first')} required />
              <Input placeholder="Last Name" value={form.last} onChange={update('last')} required />
            </div>
            <Input placeholder="Street Address" value={form.address} onChange={update('address')} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input placeholder="City" value={form.city} onChange={update('city')} />
              <Input placeholder="State (e.g. MD)" value={form.state} onChange={update('state')} />
              <Input placeholder="ZIP Code" value={form.zip} onChange={update('zip')} />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Searching...' : 'Skip Trace'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
