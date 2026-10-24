import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-wider text-text-muted">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 transition-colors focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error && 'border-danger focus:border-danger focus:ring-danger',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-danger mt-1">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
