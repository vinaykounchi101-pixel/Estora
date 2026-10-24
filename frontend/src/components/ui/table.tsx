import React from 'react';

/**
 * Editorial Table Component Suite
 * Styled tabular components with warm border accents, responsive scroll container, and accessible markup.
 */

export function TableContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border bg-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <table className={`w-full text-left text-sm border-collapse ${className}`}>{children}</table>;
}

export function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <thead className={`border-b border-border bg-surface-raised/60 text-xs font-semibold uppercase tracking-wider text-text-muted ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-border/60 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={`px-4 py-3.5 font-medium whitespace-nowrap ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 text-text align-middle ${className}`}>{children}</td>;
}
