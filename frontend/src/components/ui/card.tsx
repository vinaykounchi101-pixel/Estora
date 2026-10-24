import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  hoverLift?: boolean;
}

export function Card({ className, raised = false, hoverLift = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border transition-all',
        raised ? 'bg-surface-raised shadow-md' : 'bg-surface shadow-sm',
        hoverLift && 'card-hover-lift',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-serif text-2xl font-normal text-text tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
