'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-pill border border-border bg-surface flex items-center justify-center opacity-70',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-pill border border-border bg-surface text-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#B17D58] transition-transform duration-200 rotate-0" />
      ) : (
        <Moon className="w-4 h-4 text-stone transition-transform duration-200 rotate-0" />
      )}
    </button>
  );
}
