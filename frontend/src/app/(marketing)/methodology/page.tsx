import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  BarChart2,
  Database,
  ArrowRight,
  AlertTriangle,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1 py-16 sm:py-24">
        <Container className="space-y-16 max-w-4xl">
          {/* Header */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2">
              <Badge variant="sage" className="gap-1.5 py-0.5 px-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Model Provenance & Audit</span>
              </Badge>
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider">
                Model v1.0.0
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-text leading-[1.12]">
              Pune Residential Valuation Methodology
            </h1>

            <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl">
              A comprehensive technical overview of the dataset audit, spatial cross-validation, feature engineering,
              held-out metrics, and known operational limitations.
            </p>
          </div>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg border border-border bg-surface space-y-1 shadow-xs">
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider">Prepared Records</span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-text">1,833</p>
              <span className="text-[11px] text-text-muted">Primary Pune market</span>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface space-y-1 shadow-xs">
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider">Holdout MAE</span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-primary">₹17.35L</p>
              <span className="text-[11px] text-text-muted">Mean absolute error</span>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface space-y-1 shadow-xs">
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider">Holdout R²</span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-[#47765A] dark:text-[#C4CEB8]">0.807</p>
              <span className="text-[11px] text-text-muted">Variance explained</span>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface space-y-1 shadow-xs">
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider">Holdout MedAE</span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-text">₹8.41L</p>
              <span className="text-[11px] text-text-muted">Median absolute error</span>
            </div>
          </div>

          {/* Section: Provenance & Training Baseline */}
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-serif text-2xl font-medium text-text">Dataset Provenance & Collection</h2>
            </div>

            <div className="prose prose-sm dark:prose-invert text-text-muted text-xs sm:text-sm leading-relaxed space-y-4">
              <p>
                The active model pipeline (<code className="font-mono text-xs bg-surface-raised px-1 py-0.5 rounded">estora_pune_residential_sale_price v1.0.0</code>)
                was trained using an audited dataset of <strong>1,833 Pune residential property listings</strong> originating from circa-2020 real estate portal records.
              </p>
              <div className="p-4 rounded-md border border-amber-500/20 bg-amber-500/5 text-xs text-text space-y-2">
                <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Important Price Semantics Disclosure</span>
                </div>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  The dataset captures <strong>advertised listing asking prices</strong> rather than final completed deed transaction values.
                  Furthermore, because the records originate from circa 2020, substantial market appreciation has occurred across the Pune metropolitan region.
                  Estimates should be utilized for relative spatial comparison and decision support, not legal or formal financial appraisal.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Validation Metrics Table */}
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-serif text-2xl font-medium text-text">Cross-Validation vs. Holdout Evaluation</h2>
              <p className="text-xs text-text-muted">
                Trained using HistGradientBoosting with spatial GroupKFold partitions to prevent geographic data leakage.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-raised/70 border-b border-border text-text-muted uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Metric</th>
                    <th className="p-3.5">5-Fold Cross-Validation</th>
                    <th className="p-3.5">Held-Out Test Set (20%)</th>
                    <th className="p-3.5">Baseline (Dummy Median)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-text">
                  <tr>
                    <td className="p-3.5 font-medium">Mean Absolute Error (MAE)</td>
                    <td className="p-3.5">₹16.07 ± 0.98 Lakhs</td>
                    <td className="p-3.5 font-medium text-primary">₹17.35 Lakhs</td>
                    <td className="p-3.5 text-text-muted">₹47.66 Lakhs</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium">Root Mean Squared Error (RMSE)</td>
                    <td className="p-3.5">₹31.71 Lakhs</td>
                    <td className="p-3.5">₹40.71 Lakhs</td>
                    <td className="p-3.5 text-text-muted">₹78.22 Lakhs</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium">Coefficient of Determination (R²)</td>
                    <td className="p-3.5">0.834</td>
                    <td className="p-3.5 font-medium text-[#47765A] dark:text-[#C4CEB8]">0.807</td>
                    <td className="p-3.5 text-text-muted">-0.016</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium">Median Absolute Error (MedAE)</td>
                    <td className="p-3.5">—</td>
                    <td className="p-3.5">₹8.41 Lakhs</td>
                    <td className="p-3.5 text-text-muted">₹38.50 Lakhs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Operational Envelope & Geographic Bounds */}
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-serif text-2xl font-medium text-text">Supported Geographic Operational Envelope</h2>
            </div>

            <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-medium text-text">Pune Metropolitan Region, Maharashtra, India</p>
                  <p className="text-text-muted leading-relaxed">
                    Predictions are restricted strictly to validated Pune micro-markets. The inference engine
                    enforces latitude bounds between <strong>17.90° N and 19.30° N</strong> and longitude bounds
                    between <strong>73.20° E and 75.30° E</strong>. Out-of-bounds coordinates return structured 422 errors.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border/60">
                  <span className="text-text-muted block text-[11px]">Supported Localities</span>
                  <span className="font-medium text-text">Wakad, Baner, Kothrud</span>
                </div>
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border/60">
                  <span className="text-text-muted block text-[11px]">IT Corridors</span>
                  <span className="font-medium text-text">Hinjewadi, Kharadi, Viman Nagar</span>
                </div>
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border/60">
                  <span className="text-text-muted block text-[11px]">Area Range</span>
                  <span className="font-medium text-text">150 to 8,000 sq. ft.</span>
                </div>
                <div className="p-2.5 rounded bg-surface-raised/40 border border-border/60">
                  <span className="text-text-muted block text-[11px]">BHK Configurations</span>
                  <span className="font-medium text-text">1 to 10 BHK</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-surface-raised/40">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-medium text-text">Ready to run a valuation?</h3>
              <p className="text-xs text-text-muted">Launch the Valuation Studio with verified Pune locality presets.</p>
            </div>
            <Link href="/predict">
              <Button variant="primary" className="gap-2 text-xs">
                <span>Open Valuation Studio</span>
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
