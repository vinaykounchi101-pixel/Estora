'use client';

/**
 * Editorial Toast Notification System
 * Provides non-intrusive feedback for mutations (e.g. profile saved, valuation created, link copied).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-md border shadow-lg bg-surface text-text animate-fade-in transition-all text-sm"
            style={{
              borderColor:
                t.type === 'error'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : t.type === 'success'
                  ? 'rgba(71, 118, 90, 0.4)'
                  : 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-primary shrink-0" />}
              <span className="font-sans text-xs font-medium leading-relaxed">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-text-muted hover:text-text p-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType['toast'] {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
