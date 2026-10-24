import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface transition-colors py-14">
      <Container className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-medium tracking-tight text-text">
              ESTORA
            </span>
            <p className="text-sm font-sans text-text-muted leading-relaxed max-w-md">
              A portfolio-grade decision-support platform designed to estimate residential property sale values
              using validated machine-learning pipelines, transparent provenance, and rigorous statistical cross-validation.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="sage" className="gap-1.5 py-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Validated Model v1.0.0</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-0.5">
                <Activity className="w-3.5 h-3.5 text-sage" />
                <span>Pune Primary Market</span>
              </Badge>
            </div>
          </div>

          {/* Architecture & Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">Platform</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/#capabilities" className="hover:text-text transition-colors">
                  Inference Engine
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-text transition-colors">
                  Decision Workflow
                </Link>
              </li>
              <li>
                <Link href="/#provenance" className="hover:text-text transition-colors">
                  Dataset Provenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Technical */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">Integrity</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <span className="inline-block text-text-muted">FastAPI Service v1</span>
              </li>
              <li>
                <span className="inline-block text-text-muted">HistGradientBoosting</span>
              </li>
              <li>
                <span className="inline-block text-text-muted">GroupKFold Validation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-text-muted">
          <p className="max-w-2xl leading-relaxed">
            <strong>Decision Support Disclaimer:</strong> Valuations provided by Estora are statistical estimations
            derived from curated historical market data (circa-2020 baseline) and machine-learning models. They are
            intended solely for analytical decision support and do not constitute formal real estate appraisals,
            financial advisory services, or commercial transaction guarantees.
          </p>
          <p className="shrink-0 text-text-muted/80">
            &copy; {new Date().getFullYear()} Estora. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
