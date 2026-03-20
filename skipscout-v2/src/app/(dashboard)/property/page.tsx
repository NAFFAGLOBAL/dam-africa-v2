'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PropertyPage() {
  const [form, setForm] = useState({ address: '', city: '', state: '', zip: '' });
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
          message: `Look up property and mortgage data for: ${form.address}, ${form.city}, ${form.state} ${form.zip}`,
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
        <h1 className="text-2xl font-bold text-slate-900">Property Lookup</h1>
        <p className="text-sm text-slate-500">
          Look up property value, mortgage history, and owner demographics. 5 credits per lookup.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Address</CardTitle>
          <CardDescription>Enter the full property address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Street Address" value={form.address} onChange={update('address')} required />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input placeholder="City" value={form.city} onChange={update('city')} required />
              <Input placeholder="State" value={form.state} onChange={update('state')} required />
              <Input placeholder="ZIP" value={form.zip} onChange={update('zip')} />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
              {loading ? 'Looking up...' : 'Look Up Property'}
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
          <CardHeader><CardTitle className="text-base">Property Data</CardTitle></CardHeader>
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
