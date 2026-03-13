'use client';

import { cn, getScoreGrade, getScoreColor } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreGauge({
  score,
  maxScore = 1000,
  size = 160,
  strokeWidth = 12,
  className,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 1.5; // 270 degree arc
  const normalizedScore = Math.min(score / maxScore, 1);
  const strokeDashoffset = circumference - normalizedScore * circumference;
  const grade = getScoreGrade(score);
  const colorClass = getScoreColor(score);

  // Convert Tailwind color classes to SVG stroke colors
  const strokeColorMap: Record<string, string> = {
    'text-emerald-500': '#10b981',
    'text-blue-500': '#3b82f6',
    'text-yellow-500': '#eab308',
    'text-orange-500': '#f97316',
    'text-red-500': '#ef4444',
  };
  const strokeColor = strokeColorMap[colorClass] || '#6b7280';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[135deg]"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - circumference}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold tabular-nums', colorClass)}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium mt-0.5">
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
