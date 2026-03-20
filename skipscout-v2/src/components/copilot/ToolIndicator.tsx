'use client';

import { cn } from '@/lib/utils';

const toolLabels: Record<string, string> = {
  versium_contact_append: 'Searching Versium REACH for contact data...',
  versium_demographic_append: 'Looking up property & demographic data...',
  versium_firmographic_append: 'Looking up business firmographic data...',
  versium_b2c_estimate: 'Estimating B2C consumer audience...',
  versium_b2b_estimate: 'Estimating B2B business contacts...',
  versium_ip_domain: 'Resolving IP to business domain...',
  check_user_credits: 'Checking your credit balance...',
  get_account_activity: 'Fetching account activity...',
  deduct_credits: 'Processing credit deduction...',
};

export function ToolIndicator({
  toolName,
  className,
}: {
  toolName: string;
  className?: string;
}) {
  const label = toolLabels[toolName] || `Running ${toolName}...`;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700',
        className
      )}
    >
      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
      {label}
    </div>
  );
}
