'use client';

/**
 * Personal Activity Analytics Page
 * Computes portfolio aggregations across the user's actual saved prediction records.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { PredictionResponse } from '@/types/prediction';
import { UserAnalyticsSummary } from '@/types/analytics';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  BarChart3,
  Calculator,
  PieChart,
  Layers,
  Info,
  Building2,
  TrendingUp,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [summary, setSummary] = useState<UserAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!token) return;

      setIsLoading(true);
      try {
        const [historyData, summaryData] = await Promise.all([
          apiClient.predictions.listUserPredictions({ skip: 0, limit: 100 }, { authToken: token }),
          apiClient.analytics.getUserSummary({ authToken: token }),
        ]);

        if (isMounted) {
          setPredictions(historyData);
          setSummary(summaryData);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Derived aggregations strictly computed from user's predictions
  const bhkDistribution = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (const p of predictions) {
      const bhk = (p.property_inputs as Record<string, unknown>)?.bhk_no as number;
      if (bhk) {
        counts[bhk] = (counts[bhk] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([bhk, count]) => ({ bhk: Number(bhk), count }))
      .sort((a, b) => a.bhk - b.bhk);
  }, [predictions]);

  const localityDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of predictions) {
      const loc = ((p.property_inputs as Record<string, unknown>)?.address as string) || 'Pune';
      counts[loc] = (counts[loc] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([locality, count]) => ({ locality, count }))
      .sort((a, b) => b.count - a.count);
  }, [predictions]);

  const avgPricePerSqFt = React.useMemo(() => {
    if (predictions.length === 0) return null;
    let totalRate = 0;
    let validCount = 0;

    for (const p of predictions) {
      const sqft = (p.property_inputs as Record<string, unknown>)?.square_ft as number;
      if (sqft && sqft > 0) {
        // price in INR = lakhs * 100000
        const rate = (p.estimated_price_lakhs * 100000) / sqft;
        totalRate += rate;
        validCount += 1;
      }
    }

    return validCount > 0 ? Math.round(totalRate / validCount) : null;
  }, [predictions]);

  return (
    <DashboardLayout
      title="Personal Valuation Analytics"
      subtitle="Statistical breakdown computed strictly from your private saved property valuations."
    >
      <div className="space-y-8">
        {/* Disclosure Notice */}
        <div className="p-4 rounded-md border border-primary/20 bg-primary/5 text-xs text-text flex items-start gap-3 leading-relaxed">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Personal Activity Disclaimer:</strong> The metrics below reflect distributions and averages
            calculated solely from your personal portfolio of <strong>{predictions.length} saved valuations</strong>.
            These figures do not represent metropolitan-wide macroeconomic real estate indicators or commercial registry data.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : predictions.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Insufficient Valuation Data"
            description="You have not saved any property valuations yet. Valuations you create and save will populate this analytics view."
            action={
              <Link href="/predict">
                <Button variant="primary" size="sm" className="gap-2 text-xs">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Create First Valuation</span>
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            {/* Aggregate Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card className="border border-border bg-surface p-6 shadow-xs space-y-1.5">
                <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                  Portfolio Sample Size
                </span>
                <p className="font-serif text-3xl font-medium text-text">{predictions.length}</p>
                <span className="text-[11px] text-text-muted">Total evaluated properties</span>
              </Card>

              <Card className="border border-border bg-surface p-6 shadow-xs space-y-1.5">
                <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                  Average Capital Estimate
                </span>
                <p className="font-serif text-3xl font-medium text-primary">
                  {summary?.average_sale_estimate_lakhs
                    ? `₹${summary.average_sale_estimate_lakhs.toFixed(2)}L`
                    : '—'}
                </p>
                <span className="text-[11px] text-text-muted">Mean value in INR Lakhs</span>
              </Card>

              <Card className="border border-border bg-surface p-6 shadow-xs space-y-1.5">
                <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                  Avg. Estimated Rate / Sq. Ft.
                </span>
                <p className="font-serif text-3xl font-medium text-[#47765A] dark:text-[#C4CEB8]">
                  {avgPricePerSqFt ? `₹${avgPricePerSqFt.toLocaleString('en-IN')}` : '—'}
                </p>
                <span className="text-[11px] text-text-muted">Derived carpet rate</span>
              </Card>
            </div>

            {/* Distribution Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BHK Distribution Card */}
              <Card className="border border-border bg-surface p-6 space-y-4">
                <div className="border-b border-border/80 pb-3">
                  <h3 className="font-serif text-lg font-medium text-text">BHK Configuration Breakdown</h3>
                  <p className="text-xs text-text-muted">Distribution of bedrooms across saved assets.</p>
                </div>

                <div className="space-y-3">
                  {bhkDistribution.map(({ bhk, count }) => {
                    const percentage = Math.round((count / predictions.length) * 100);
                    return (
                      <div key={bhk} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-text">{bhk} BHK Property</span>
                          <span className="text-text-muted">{count} valuations ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Locality Distribution Card */}
              <Card className="border border-border bg-surface p-6 space-y-4">
                <div className="border-b border-border/80 pb-3">
                  <h3 className="font-serif text-lg font-medium text-text">Locality Distribution</h3>
                  <p className="text-xs text-text-muted">Evaluated micro-markets in Pune.</p>
                </div>

                <div className="space-y-3">
                  {localityDistribution.map(({ locality, count }) => {
                    const percentage = Math.round((count / predictions.length) * 100);
                    return (
                      <div key={locality} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-text">{locality}</span>
                          <span className="text-text-muted">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                          <div
                            className="h-full bg-sage rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
