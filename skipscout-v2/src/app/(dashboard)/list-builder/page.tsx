'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Building2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ListBuilderPage() {
  const [listType, setListType] = useState<'b2c' | 'b2b'>('b2c');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prompt =
        listType === 'b2b'
          ? `I want to build a B2B lead list: ${query}`
          : `I want to build a B2C consumer list: ${query}`;

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history: [] }),
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">List Builder</h1>
        <p className="text-sm text-slate-500">
          Build targeted B2B or B2C lead lists with 80+ filters.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={listType === 'b2c' ? 'default' : 'outline'}
          onClick={() => setListType('b2c')}
          className="gap-2"
        >
          <Users className="h-4 w-4" /> B2C Consumer
        </Button>
        <Button
          variant={listType === 'b2b' ? 'default' : 'outline'}
          onClick={() => setListType('b2b')}
          className="gap-2"
        >
          <Building2 className="h-4 w-4" /> B2B Business
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {listType === 'b2b' ? 'B2B List Criteria' : 'B2C List Criteria'}
          </CardTitle>
          <CardDescription>
            {listType === 'b2b'
              ? 'Describe your target businesses — industry, state, revenue, employee size, etc.'
              : 'Describe your target audience — state, age, homeownership, income, etc.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={
                listType === 'b2b'
                  ? 'e.g. RV parks in CA, TX, FL with 10+ employees'
                  : 'e.g. Homeowners in WA, age 55+, single family homes built before 1995'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              {loading ? 'Estimating...' : 'Get Estimate'}
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
          <CardHeader><CardTitle className="text-base">Estimate Results</CardTitle></CardHeader>
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
