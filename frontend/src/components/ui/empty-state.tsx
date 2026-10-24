import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border/80 bg-surface/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4 text-text-muted">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-medium text-text mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
