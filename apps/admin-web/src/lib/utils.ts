import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' Mrd FCFA';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' M FCFA';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' K FCFA';
  }
  return formatCurrency(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-CI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-CI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('225') && cleaned.length === 13) {
    const local = cleaned.slice(3);
    return `+225 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getScoreColor(score: number): string {
  if (score >= 800) return 'text-emerald-500';
  if (score >= 650) return 'text-blue-500';
  if (score >= 500) return 'text-yellow-500';
  if (score >= 350) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreGrade(score: number): string {
  if (score >= 800) return 'A';
  if (score >= 650) return 'B';
  if (score >= 500) return 'C';
  if (score >= 350) return 'D';
  return 'E';
}

export function getScoreBgColor(score: number): string {
  if (score >= 800) return 'bg-emerald-500';
  if (score >= 650) return 'bg-blue-500';
  if (score >= 500) return 'bg-yellow-500';
  if (score >= 350) return 'bg-orange-500';
  return 'bg-red-500';
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
