import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QuickValuationCard } from '@/features/prediction/components/quick-valuation-card';
import { ParallaxHeroImage } from '@/components/motion/parallax-hero-image';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  Compass,
  ArrowDown,
  ArrowRight,
  Database,
  BarChart3,
  Sliders,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text transition-colors">
      <Header />

      <main className="flex-1">
        {/* =========================================================================
            1. SPACIOUS EDITORIAL HERO SECTION
        ========================================================================= */}
        <section className="relative overflow-hidden min-h-[82vh] lg:min-h-[88vh] flex items-center border-b border-border/60">
          {/* Architectural Image with bounded scroll parallax and theme-tailored edge fades */}
          <ParallaxHeroImage />

          {/* Hero Content Layer */}
          <Container className="relative z-10 py-20 sm:py-28 lg:py-36">
            <div className="max-w-3xl space-y-8">
              {/* Eyebrow / Overline */}
              <div className="animate-entrance-1 inline-flex items-center gap-2.5">
                <Badge variant="sage" className="gap-1.5 py-1 px-3.5">
                  <span className="w-1.5 h-1.5 rounded-pill bg-[#47765A] dark:bg-[#C4CEB8] animate-pulse" />
                  <span>Estora Intelligence v1.0</span>
                </Badge>
                <span className="text-xs font-sans text-text-muted tracking-wider uppercase font-medium">
                  Validated Pune Residential Primary Market
                </span>
              </div>

              {/* Majestic Editorial Headline */}
              <h1 className="animate-entrance-2 font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-text leading-[1.08]">
                Smarter Decisions for a Brighter Future
              </h1>

              {/* Refined Supporting Copy */}
              <p className="animate-entrance-3 font-sans text-base sm:text-lg lg:text-xl text-text-muted leading-relaxed max-w-2xl">
                Predict residential property prices, explore verified spatial trends, and evaluate real estate
                decisions with empirical machine-learning models and leakage-free cross-validation.
              </p>

              {/* Action Buttons */}
              <div className="animate-entrance-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="#valuation-section">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2.5 shadow-sm text-sm">
                    <span>Explore Valuation Model</span>
                    <ArrowDown className="w-4 h-4 text-sage dark:text-[#B17D58]" />
                  </Button>
                </Link>
                <Link href="#provenance">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm">
                    Audit Provenance & Data
                  </Button>
                </Link>
              </div>

              {/* Subtitle Integrity Badge */}
              <div className="animate-entrance-4 pt-4 flex items-center gap-3 text-xs text-text-muted font-sans">
                <span className="inline-flex items-center gap-1.5 text-text font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                  1,833 Audited Records
                </span>
                <span className="text-border">•</span>
                <span>GroupKFold CV</span>
                <span className="text-border">•</span>
                <span>Sub-50ms Inference</span>
              </div>
            </div>
          </Container>
        </section>

        {/* =========================================================================
            2. TRUST & METHODOLOGY METRIC STRIP
        ========================================================================= */}
        <section className="border-b border-border/60 bg-surface/80 py-10 transition-colors">
          <Container>
            <ScrollReveal direction="up" distance={12}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                <div className="text-center sm:text-left sm:pr-6">
                  <div className="font-serif text-3xl sm:text-4xl font-medium text-text">1,833</div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">
                    Approved Pune Listings
                  </div>
                  <p className="text-[11px] text-text-muted/80 mt-1">
                    Audited for zero spatial and duplicate leakage
                  </p>
                </div>

                <div className="pt-6 sm:pt-0 sm:px-6 text-center sm:text-left">
                  <div className="font-serif text-3xl sm:text-4xl font-medium text-text">₹ 17.35L</div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">
                    Holdout MAE
                  </div>
                  <p className="text-[11px] text-text-muted/80 mt-1">
                    Calibrated in INR Lakhs against real market transactions
                  </p>
                </div>

                <div className="pt-6 sm:pt-0 sm:px-6 text-center sm:text-left">
                  <div className="font-serif text-3xl sm:text-4xl font-medium text-text">0.81</div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">
                    Holdout R² Score
                  </div>
                  <p className="text-[11px] text-text-muted/80 mt-1">
                    Empirical validation on held-out micro-markets
                  </p>
                </div>

                <div className="pt-6 sm:pt-0 sm:pl-6 text-center sm:text-left">
                  <div className="font-serif text-3xl sm:text-4xl font-medium text-text flex items-center justify-center sm:justify-start gap-1">
                    <span>&lt; 50ms</span>
                    <Zap className="w-4 h-4 text-sage" />
                  </div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-1">
                    FastAPI Uvicorn Latency
                  </div>
                  <p className="text-[11px] text-text-muted/80 mt-1">
                    Eagerly preloaded pipeline in server memory
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* =========================================================================
            3. DEDICATED VALUATION WORKSPACE SECTION
        ========================================================================= */}
        <section id="valuation-section" className="py-20 sm:py-28 lg:py-32 border-b border-border/60 scroll-mt-20">
          <Container className="space-y-14">
            <ScrollReveal direction="up" distance={16}>
              <div className="max-w-2xl space-y-3">
                <Badge variant="sage">Interactive Valuation Workspace</Badge>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-text font-medium tracking-tight">
                  Predict Residential Property Valuation
                </h2>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  Configure real residential attributes below to execute the live Pune valuation pipeline.
                  Every prediction returns exact model versioning, target currency metadata, and an explicit
                  decision-support disclaimer.
                </p>
              </div>
            </ScrollReveal>

            {/* Two-Column Layout: Model Guidance on Left, Interactive Form on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Column: Guidance & Feature Architecture */}
              <div className="lg:col-span-5 space-y-6">
                <ScrollReveal delay={120}>
                  <Card hoverLift className="p-7 space-y-5 bg-surface/90 border border-border">
                    <CardHeader className="p-0">
                      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                        Feature Architecture
                      </span>
                      <CardTitle className="text-2xl mt-1">Calibrated Input Factors</CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 space-y-4 text-xs text-text-muted leading-relaxed">
                      <p>
                        The Pune residential model takes into account nine distinct structural and spatial variables
                        to compute price estimates:
                      </p>

                      <ul className="space-y-2.5 pt-1">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                          <span><strong>Built-up Area:</strong> Bounded between 200 and 8,000 sq ft.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                          <span><strong>BHK Configuration:</strong> Discrete bedrooms from 1 to 5+ units.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                          <span><strong>Spatial Coordinates:</strong> High-precision latitude & longitude within the Pune metropolitan perimeter.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                          <span><strong>Statutory Features:</strong> Official RERA registration status, ready-to-move vs under-construction state, and resale flag.</span>
                        </li>
                      </ul>

                      <div className="pt-4 border-t border-border/80 flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Endpoint Contract</span>
                        <code className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-text font-mono">
                          POST /api/v1/predictions/sale-price
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <div className="rounded-lg border border-border bg-black/5 dark:bg-white/5 p-5 space-y-2 text-xs">
                    <div className="font-medium text-text flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sage" />
                      <span>Transparent Model Governance</span>
                    </div>
                    <p className="text-text-muted leading-relaxed">
                      Predictions are generated purely using the pre-loaded offline artifact. No database records
                      are seeded with dummy data, and no private data is collected during anonymous preview requests.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Column: Interactive Quick Valuation Card */}
              <div className="lg:col-span-7">
                <ScrollReveal delay={150}>
                  <QuickValuationCard />
                </ScrollReveal>
              </div>
            </div>
          </Container>
        </section>

        {/* =========================================================================
            4. CORE CAPABILITIES (REFINED GRID)
        ========================================================================= */}
        <section id="capabilities" className="py-20 sm:py-28 border-b border-border/60 bg-surface/50 transition-colors">
          <Container className="space-y-16">
            <ScrollReveal direction="up">
              <div className="max-w-2xl space-y-3">
                <Badge variant="outline">Core Capabilities</Badge>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-text font-medium tracking-tight">
                  Built on Empirical Evidence, Not Speculative Guesswork
                </h2>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  Estora bridges luxury architectural design with reproducible data science. Every valuation
                  is produced by an auditable pipeline trained strictly on verified residential properties.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal delay={80}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="w-11 h-11 rounded-pill bg-sage/20 dark:bg-sage/10 text-text flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-text" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">Price Prediction</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    HistGradientBoosting regressor with log target transform calibrated on 1,833 clean listings
                    across major Pune micro-markets.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={160}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="w-11 h-11 rounded-pill bg-[#B17D58]/20 dark:bg-[#B17D58]/10 text-text flex items-center justify-center">
                    <Compass className="w-5 h-5 text-text" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">Spatial Integrity</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    5-Fold GroupKFold cross-validation grouped by locality to eliminate neighborhood data leakage
                    and prevent over-optimistic claims.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={240}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="w-11 h-11 rounded-pill bg-black/5 dark:bg-white/10 text-text flex items-center justify-center">
                    <Database className="w-5 h-5 text-text" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">Statutory Alignment</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Enforces RERA registration, construction state, possession readiness, and seller identity
                    as structural features in price formation.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={320}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="w-11 h-11 rounded-pill bg-sage/30 dark:bg-sage/20 text-text flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-text" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">Separated Lifecycles</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Sale-price and rental valuations are strictly decoupled into independent models to prevent
                    false capitalization rate assumptions.
                  </p>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* =========================================================================
            5. HOW IT WORKS (3-STEP EDITORIAL WORKFLOW)
        ========================================================================= */}
        <section id="how-it-works" className="py-20 sm:py-28 border-b border-border/60 transition-colors">
          <Container className="space-y-16">
            <ScrollReveal direction="up">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <Badge variant="sage">Decision Workflow</Badge>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-text font-medium tracking-tight">
                  From Property Attributes to Actionable Intelligence
                </h2>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  How our FastAPI inference service evaluates residential real estate in milliseconds.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal delay={100}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-pill bg-text text-background text-sm font-semibold flex items-center justify-center">
                      1
                    </span>
                    <Sliders className="w-5 h-5 text-text-muted" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">1. Enter Property Details</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Specify built-up area in square feet, BHK count, latitude/longitude coordinates, Pune micro-market,
                    and transaction terms.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-pill bg-text text-background text-sm font-semibold flex items-center justify-center">
                      2
                    </span>
                    <ShieldCheck className="w-5 h-5 text-text-muted" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">2. Eager Model Inference</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    The preloaded pipeline deserializes the request, computes non-linear tree splits, and predicts
                    market valuation in INR Lakhs.
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <Card hoverLift className="p-7 space-y-4 h-full">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-pill bg-text text-background text-sm font-semibold flex items-center justify-center">
                      3
                    </span>
                    <BarChart3 className="w-5 h-5 text-text-muted" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-text">3. Decision Transparency</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Every valuation returns exact model versioning, target currency metadata, and an explicit
                    decision-support disclaimer.
                  </p>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* =========================================================================
            6. CINEMATIC EDITORIAL TRANSITION & PROVENANCE
        ========================================================================= */}
        <section id="provenance" className="py-24 sm:py-32 bg-[#141511] text-[#F2F0E9] transition-colors">
          <Container>
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto space-y-6 text-center">
                <Badge variant="outline" className="border-white/20 text-[#C4CEB8]">
                  Transparency Guarantee
                </Badge>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#FEFDFC]">
                  Real Data. Better Decisions.
                </h2>
                <p className="text-sm sm:text-base text-[#B8B9AE] leading-relaxed">
                  Estora does not advertise simulated listing portfolios, artificial confidence scores, or
                  fabricated accuracy percentages. Our current v1.0 release is strictly calibrated for Pune
                  residential sales. Rental valuations and additional metropolitan areas will deploy as distinct,
                  empirically audited pipelines in future phases.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="#valuation-section">
                    <Button size="lg" variant="primary" className="bg-[#FEFDFC] text-[#141511] hover:bg-[#F2F0E9] w-full sm:w-auto">
                      <span>Launch Pune Valuation Tool</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
