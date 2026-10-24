import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'sage' | 'bronze' | 'outline' | 'danger';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-black/5 text-text border border-border dark:bg-white/10',
    sage: 'bg-[#C4CEB8]/30 text-[#453F22] border border-[#C4CEB8]/50 dark:bg-[#C4CEB8]/20 dark:text-[#C4CEB8]',
    bronze: 'bg-[#B17D58]/20 text-[#8D7658] border border-[#B17D58]/40 dark:bg-[#B17D58]/20 dark:text-[#B17D58]',
    outline: 'bg-transparent text-text border border-border',
    danger: 'bg-danger/10 text-danger border border-danger/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium tracking-wide uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
