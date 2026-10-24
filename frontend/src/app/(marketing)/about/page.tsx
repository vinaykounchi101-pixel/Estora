import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Building2,
  Database,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  Layers,
  Compass,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <Container className="space-y-20 max-w-4xl">
          {/* Hero Header */}
          <div className="space-y-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2">
              <Badge variant="sage" className="gap-1.5 py-0.5 px-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Architecture & Mission</span>
              </Badge>
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider">
                Platform Specification
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-text leading-[1.12]">
              Architectural Intelligence for Real Estate Valuation
            </h1>

            <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl">
              Estora is an editorial decision-support platform designed to estimate residential property sale values
              using validated, reproducible machine-learning pipelines, strict data hygiene, and transparent spatial boundaries.
            </p>
          </div>

          {/* Architectural Layers Section */}
          <div className="space-y-8">
            <div className="space-y-2 border-b border-border pb-4">
              <h2 className="font-serif text-2xl font-medium text-text">Multi-Layer System Architecture</h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Adhering strictly to SRS Section 13 layer isolation boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-border bg-surface space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-text">Next.js 14 Frontend Foundation</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Engineered with React Server Components, TypeScript, and Tailwind CSS. Employs the Editorial Luxury
                  palette (Warm Ivory, Sand, Sage, and Warm Charcoal) with responsive layouts and bounded motion.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-surface space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-text">FastAPI Inference Service</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Versioned HTTP API endpoints under <code className="font-mono text-[11px] bg-surface-raised px-1 py-0.5 rounded">/api/v1</code>.
                  Serves preloaded model artifacts with schema validation, structured error envelopes, and zero on-demand training during HTTP requests.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-surface space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-text">PostgreSQL Persistence & Alembic</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Relational storage managed via SQLAlchemy ORM and Alembic migrations. Maintains immutable prediction history
                  snapshots, model registry metadata, and secure bcrypt user credentials.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-surface space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-text">Offline Scikit-Learn ML Package</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Reusable <code className="font-mono text-[11px] bg-surface-raised px-1 py-0.5 rounded">real_estate_ml</code> library.
                  Enforces target leakage prevention, GroupKFold spatial cross-validation, and holdout metric generation.
                </p>
              </div>
            </div>
          </div>

          {/* Data Governance & Limitations */}
          <div className="p-8 rounded-xl border border-border bg-surface space-y-6">
            <h2 className="font-serif text-2xl font-medium text-text">Core Governance Principles</h2>

            <div className="space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                <p>
                  <strong>Distinct Prediction Targets:</strong> Sale-price and monthly-rent workflows are treated as
                  entirely separate domains. While sale-price estimation for Pune is active, rental models remain in dataset audit.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                <p>
                  <strong>Asking Price Semantics:</strong> Training datasets reflect historical asking prices (circa-2020 baseline),
                  not final negotiated registry prices. Output estimates must be understood as decision-support indicators.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                <p>
                  <strong>Geographic Bounds Enforcement:</strong> The inference engine strictly checks latitude [17.90, 19.30]
                  and longitude [73.20, 75.30]. Out-of-bounds requests are rejected rather than returning deceptive extrapolations.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                <p>
                  <strong>No Synthetic Evidence:</strong> No synthetic or fabricated financial metrics are passed off as real-market accuracy evidence.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-xl border border-border/80 bg-surface-raised/40">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-serif text-xl font-medium text-text">Explore Technical Methodology</h3>
              <p className="text-xs text-text-muted">
                Inspect cross-validation results, held-out metrics, and feature transformations.
              </p>
            </div>
            <Link href="/methodology">
              <Button variant="primary" className="gap-2 text-xs">
                <span>View Methodology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
