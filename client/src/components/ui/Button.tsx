import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-xs hover:shadow focus:ring-blue-500',
  secondary:
    'bg-slate-800 hover:bg-slate-900 text-white border-transparent shadow-xs hover:shadow focus:ring-slate-700',
  outline:
    'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs focus:ring-blue-500',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent focus:ring-slate-400',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-xs hover:shadow focus:ring-rose-500',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs hover:shadow focus:ring-emerald-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-[11px] px-2.5 py-1 rounded-md gap-1.5 min-h-[28px]',
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-2 min-h-[32px]',
  md: 'text-xs sm:text-sm px-4 py-2 rounded-lg gap-2 min-h-[38px]',
  lg: 'text-sm px-5 py-2.5 rounded-xl gap-2.5 min-h-[44px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 border cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
