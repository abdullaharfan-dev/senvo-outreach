import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

export type StatAccent = 'blue' | 'emerald' | 'amber' | 'cyan' | 'indigo' | 'slate';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: StatAccent;
  subtext?: string;
  trend?: {
    value: string;
    positive?: boolean;
    neutral?: boolean;
  };
  badgeText?: string;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}

const accentStyles: Record<
  StatAccent,
  {
    iconBg: string;
    iconColor: string;
    borderHover: string;
    valueColor: string;
    pillBg: string;
  }
> = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderHover: 'hover:border-blue-400',
    valueColor: 'text-slate-900',
    pillBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderHover: 'hover:border-emerald-400',
    valueColor: 'text-emerald-700',
    pillBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderHover: 'hover:border-amber-400',
    valueColor: 'text-amber-800',
    pillBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  cyan: {
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    borderHover: 'hover:border-cyan-400',
    valueColor: 'text-cyan-800',
    pillBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  },
  indigo: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    borderHover: 'hover:border-indigo-400',
    valueColor: 'text-indigo-800',
    pillBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
  slate: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    borderHover: 'hover:border-slate-400',
    valueColor: 'text-slate-900',
    pillBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'slate',
  subtext,
  trend,
  badgeText,
  onClick,
  className,
  tooltip,
}) => {
  const styles = accentStyles[accent];
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      title={tooltip}
      className={clsx(
        'bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-card transition-all duration-150 relative group',
        isInteractive && [
          'cursor-pointer',
          styles.borderHover,
          'hover:shadow-card-hover active:scale-[0.995]',
        ],
        className
      )}
    >
      {/* Header Row: Label + Icon */}
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150',
            styles.iconBg,
            styles.iconColor,
            isInteractive && 'group-hover:scale-105'
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className={clsx(
            'text-2xl sm:text-3xl font-bold tracking-tight font-sans tabular-nums',
            styles.valueColor
          )}
        >
          {value}
        </span>
        {badgeText && (
          <span
            className={clsx(
              'text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border',
              styles.pillBg
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Footer / Trend Row */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5 truncate">
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-semibold text-[11px] tabular-nums',
                trend.neutral
                  ? 'text-slate-500'
                  : trend.positive
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              )}
            >
              {trend.positive && <ArrowUpRight className="w-3 h-3 shrink-0" />}
              {!trend.positive && !trend.neutral && <ArrowDownRight className="w-3 h-3 shrink-0" />}
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-[11px] text-slate-400 truncate">{subtext}</span>}
        </div>

        {isInteractive && (
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-1" />
        )}
      </div>
    </div>
  );
};

export default StatCard;
