import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft, Home, Calculator } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <Container className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <Compass className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium font-sans">
              404 — Page Not Located
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-text">
              Unmapped Destination
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              The real estate intelligence coordinate or page you requested does not exist or has been relocated.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center gap-2 text-xs">
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </Button>
            </Link>
            <Link href="/predict" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto justify-center gap-2 text-xs">
                <Calculator className="w-3.5 h-3.5" />
                <span>Valuation Studio</span>
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
