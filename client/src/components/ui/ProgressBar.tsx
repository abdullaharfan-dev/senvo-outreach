import React from 'react';
import clsx from 'clsx';

export type ProgressColor = 'blue' | 'emerald' | 'amber' | 'cyan' | 'indigo' | 'purple' | 'slate';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: ProgressColor;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  countLabel?: string | React.ReactNode;
  className?: string;
}

const colorStyles: Record<ProgressColor, string> = {
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-600',
  purple: 'bg-purple-600',
  slate: 'bg-slate-400',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'blue',
  size = 'md',
  label,
  countLabel,
  className,
}) => {
  const safePercent = Math.min(Math.max(value, 0), 100);

  return (
    <div className={clsx('w-full space-y-1.5', className)}>
      {(label || countLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-slate-700 text-[11px] sm:text-xs truncate">{label}</span>}
          {countLabel && (
            <span className="font-semibold text-slate-900 text-[11px] sm:text-xs shrink-0 tabular-nums">
              {countLabel}
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', colorStyles[color])}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
