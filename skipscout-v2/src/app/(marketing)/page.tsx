import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Search,
  Building2,
  Users,
  Globe,
  CreditCard,
  Bot,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Skip Tracing',
    description: 'Find current phone, email, and address for any person using Versium REACH data.',
  },
  {
    icon: Building2,
    title: 'Property & Mortgage',
    description: 'Look up property values, mortgage history, LTV ratios, and owner demographics.',
  },
  {
    icon: Users,
    title: 'B2C Lead Lists',
    description: 'Build targeted consumer lists with 80+ filters — age, income, homeownership, and more.',
  },
  {
    icon: Globe,
    title: 'B2B Business Intel',
    description: 'Look up business firmographic data — revenue, employees, SIC codes, decision makers.',
  },
  {
    icon: Bot,
    title: 'AI Copilot',
    description: 'Chat with our AI to run any query in natural language. It handles the rest.',
  },
  {
    icon: CreditCard,
    title: 'Pay-As-You-Go',
    description: 'Simple credit system. No monthly fees. Buy credits and use them when you need.',
  },
];

const pricing = [
  { name: 'Starter', credits: '500', price: '$25', per: '$0.05/credit' },
  { name: 'Pro', credits: '2,000', price: '$75', per: '$0.0375/credit', popular: true },
  { name: 'Business', credits: '10,000', price: '$299', per: '$0.0299/credit' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            SS
          </div>
          <span className="text-xl font-bold text-slate-900">SkipScout</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center lg:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          AI-Powered Skip Tracing
          <br />
          <span className="text-blue-600">& Data Intelligence</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Skip trace people, look up property data, build targeted lead lists — all powered by
          AI and Versium REACH. No contracts. Pay only for what you use.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2 text-base">
              Start Free — 10 Credits <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="text-base">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-slate-50 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Everything you need for skip tracing
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm border">
                <f.icon className="h-8 w-8 text-blue-600" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">Simple Pricing</h2>
          <p className="mt-2 text-center text-slate-600">
            No monthly fees. Buy credits and use them anytime.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border-2 p-6 text-center ${
                  p.popular ? 'border-blue-600 shadow-lg' : 'border-slate-200'
                }`}
              >
                {p.popular && (
                  <span className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl font-bold">{p.price}</p>
                <p className="text-sm text-slate-500">{p.credits} credits</p>
                <p className="text-xs text-slate-400">{p.per}</p>
                <Link href="/sign-up">
                  <Button className="mt-6 w-full" variant={p.popular ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 px-6 py-10 text-center text-sm text-slate-500 lg:px-12">
        <p>SkipScout &copy; {new Date().getFullYear()} — support@skipscout.com — 509-730-5183</p>
      </footer>
    </div>
  );
}
