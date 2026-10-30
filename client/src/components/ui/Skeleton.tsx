import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-slate-200/80 animate-shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-lg',
        variant === 'rectangular' && 'rounded-none',
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
