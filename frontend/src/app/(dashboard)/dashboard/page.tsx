'use client';

/**
 * User Portfolio Dashboard
 * Displays personal valuation statistics and recent activity powered by GET /api/v1/analytics/summary.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { UserAnalyticsSummary } from '@/types/analytics';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Calculator,
  History,
  TrendingUp,
  BarChart3,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<UserAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.analytics.getUserSummary({ authToken: token });
      setSummary(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load dashboard summary.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Member'}`}
      subtitle="Overview of your residential asset valuations and prediction portfolio."
      action={
        <Link href="/predict">
          <Button variant="primary" size="sm" className="gap-2 text-xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>New Valuation</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {error && (
          <div
            role="alert"
            className="p-4 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSummary}
              className="gap-1.5 text-xs border-red-500/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Portfolio KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="border border-border/80 bg-surface p-6 shadow-xs rounded-xl flex flex-col justify-between transition-all hover:border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                  Total Saved Valuations
                </span>
                <span className="w-7 h-7 rounded-full bg-surface-raised border border-border/70 flex items-center justify-center text-text-muted">
                  <History className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-text">
                {isLoading ? '—' : summary?.total_predictions ?? 0}
              </p>
            </div>
            <span className="text-[11px] text-text-muted pt-3 border-t border-border/60 block">
              Cumulative saved property snapshots
            </span>
          </Card>

          <Card className="border border-border/80 bg-surface p-6 shadow-xs rounded-xl flex flex-col justify-between transition-all hover:border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                  Sale Price Valuations
                </span>
                <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Calculator className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-primary">
                {isLoading ? '—' : summary?.sale_predictions ?? 0}
              </p>
            </div>
            <span className="text-[11px] text-text-muted pt-3 border-t border-border/60 block">
              Pune residential micro-market evaluations
            </span>
          </Card>

          <Card className="border border-border/80 bg-surface p-6 shadow-xs rounded-xl flex flex-col justify-between transition-all hover:border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                  Average Asset Estimate
                </span>
                <span className="w-7 h-7 rounded-full bg-sage/15 border border-sage/30 flex items-center justify-center text-[#47765A] dark:text-[#C4CEB8]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#47765A] dark:text-[#C4CEB8]">
                {isLoading
                  ? '—'
                  : summary?.average_sale_estimate_lakhs
                  ? `₹${summary.average_sale_estimate_lakhs.toFixed(2)}L`
                  : '—'}
              </p>
            </div>
            <span className="text-[11px] text-text-muted pt-3 border-t border-border/60 block">
              Mean capital estimate across portfolio
            </span>
          </Card>
        </div>

        {/* Operational Context & Guidelines Banner */}
        <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-serif text-sm font-medium text-text">
                Validated Operational Coverage
              </span>
              <Badge variant="outline" className="text-[10px] py-0 border-border">
                Pune Core
              </Badge>
            </div>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              Serving residential sale-price intelligence for 8 verified Pune micro-markets including Baner, Wakad, Kothrud, Hinjewadi, and Kharadi. Latency benchmarked at ~6.6ms engine inference.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/methodology">
              <Button variant="outline" size="sm" className="text-xs h-8">
                Audit & Methodology
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Valuations Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <h2 className="font-serif text-xl font-medium text-text">Recent Valuation Activity</h2>
              <p className="text-xs text-text-muted">Your latest generated property estimates.</p>
            </div>
            {summary && summary.recent_predictions.length > 0 && (
              <Link href="/predictions" className="text-xs text-text-muted hover:text-text flex items-center gap-1 font-medium transition-colors">
                <span>View all ({summary.total_predictions})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : summary?.recent_predictions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-surface/50 p-8 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif text-lg font-medium text-text">No Valuation Activity Recorded</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Start by estimating the price of a property in Pune. Your valuation snapshots, historical parameters, and spatial estimates will be recorded here.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/predict">
                  <Button variant="primary" size="sm" className="gap-2 text-xs">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Run First Valuation</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary?.recent_predictions.map((p) => {
                const inputs = p.property_inputs as Record<string, unknown>;
                const locality = (inputs?.address as string) || p.supported_geography || 'Pune';
                const bhk = inputs?.bhk_no != null ? String(inputs.bhk_no) : '—';
                const sqft = inputs?.square_ft != null ? String(inputs.square_ft) : '—';

                return (
                  <Card key={p.id} className="border border-border/80 bg-surface p-5 rounded-xl hover:border-primary/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <span className="font-serif text-base font-medium text-text flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                            <span>{locality}</span>
                          </span>
                          <span className="text-xs text-text-muted">
                            {bhk} BHK • {sqft} sq. ft.
                          </span>
                        </div>
                        <span className="font-serif text-lg sm:text-xl font-medium text-primary">
                          ₹{p.estimated_price_lakhs.toFixed(2)}L
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(p.created_at)}</span>
                      </span>
                      <Link
                        href={`/predictions/${p.id}`}
                        className="text-text hover:text-primary font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View Snapshot</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
