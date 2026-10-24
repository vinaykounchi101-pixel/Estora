import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'btn-editorial-press inline-flex items-center justify-center font-sans font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-pill select-none';

    const variantStyles = {
      primary: 'bg-[#0F0F09] text-[#FEFDFC] hover:bg-[#252722] dark:bg-[#F2F0E9] dark:text-[#141511] dark:hover:bg-white shadow-sm',
      secondary: 'bg-surface text-text border border-border hover:bg-black/5 dark:hover:bg-white/5',
      outline: 'bg-transparent text-text border border-border hover:bg-black/5 dark:hover:bg-white/5',
      ghost: 'bg-transparent text-text hover:bg-black/5 dark:hover:bg-white/5',
      danger: 'bg-danger text-white hover:bg-danger/90',
    };

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-md px-7 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
