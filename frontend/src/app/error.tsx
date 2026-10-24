'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error to standard error monitoring
    console.error('Application Error Boundary Triggered:', error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <Container className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium font-sans">
              System Recovery State
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-text">
              An Unexpected Error Occurred
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We encountered a temporary interface issue. No system secrets or sensitive telemetry are exposed.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => reset()}
              variant="primary"
              className="w-full sm:w-auto justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Action</span>
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center gap-2 text-xs">
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
