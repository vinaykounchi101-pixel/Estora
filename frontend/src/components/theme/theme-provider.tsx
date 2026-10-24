'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'estora-theme-preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeScript() {
  const scriptContent = `
    (function() {
      try {
        var stored = localStorage.getItem('${STORAGE_KEY}');
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored === 'dark' || (stored !== 'light' && systemDark) ? 'dark' : 'light';
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      id="estora-theme-script"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // Storage access may be restricted
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      let active: ResolvedTheme = 'light';
      if (theme === 'system') {
        active = mediaQuery.matches ? 'dark' : 'light';
      } else {
        active = theme === 'dark' ? 'dark' : 'light';
      }

      setResolvedTheme(active);
      const root = document.documentElement;
      root.setAttribute('data-theme', active);
      if (active === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateResolvedTheme();

    const listener = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Storage access fallback
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
