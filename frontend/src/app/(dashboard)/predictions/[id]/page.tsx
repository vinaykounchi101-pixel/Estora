'use client';

/**
 * Dedicated Valuation Snapshot Detail Page
 * Retrieves and renders the immutable prediction record by UUID via GET /api/v1/predictions/{id}.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { PredictionResponse } from '@/types/prediction';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Cpu,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const predictionId = params?.id as string;

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!token || !predictionId) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.predictions.getPredictionDetail(predictionId, {
          authToken: token,
        });
        if (isMounted) {
          setPrediction(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Unable to retrieve valuation snapshot.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [token, predictionId]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatDerivedInr = (lakhs: number) => {
    const inr = Math.round(lakhs * 100000);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  return (
    <DashboardLayout
      title="Valuation Record Detail"
      subtitle={`Immutable snapshot ID: ${predictionId}`}
      action={
        <Link href="/predictions">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to History</span>
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {error ? (
          <Card className="border border-red-500/30 bg-surface p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-medium text-text">Record Not Found</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto">
                {error}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/predictions">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to History</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Retrieving Valuation Snapshot...
            </span>
          </div>
        ) : prediction ? (
          <div className="space-y-6 animate-fade-in">
            {/* Primary Valuation Certificate Card */}
            <Card className="border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="sage" className="gap-1 text-[10px]">
                      <Sparkles className="w-3 h-3" />
                      <span>Historical Estimate Certificate</span>
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {prediction.prediction_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Valued on {formatDate(prediction.created_at)}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-sans text-text-muted uppercase tracking-wider block">
                    Estimated Value
                  </span>
                  <div className="flex items-baseline sm:justify-end gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-medium text-primary">
                      ₹{prediction.estimated_price_lakhs.toFixed(2)} Lakhs
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    ({formatDerivedInr(prediction.estimated_price_lakhs)})
                  </span>
                </div>
              </div>

              {/* Property Feature Inputs Snapshot */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text">
                  Submitted Property Features
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <span className="text-[11px] text-text-muted block">Locality / Address</span>
                    <span className="font-medium text-xs text-text">
                      {(prediction.property_inputs as Record<string, unknown>)?.address as string || 'Pune'}
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <span className="text-[11px] text-text-muted block">Built-Up Area</span>
                    <span className="font-medium text-xs text-text">
                      {(prediction.property_inputs as Record<string, unknown>)?.square_ft as number || '—'} sq. ft.
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <span className="text-[11px] text-text-muted block">BHK Configuration</span>
                    <span className="font-medium text-xs text-text">
                      {(prediction.property_inputs as Record<string, unknown>)?.bhk_no as number || '—'} BHK
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <span className="text-[11px] text-text-muted block">Listing Entity</span>
                    <span className="font-medium text-xs text-text">
                      {(prediction.property_inputs as Record<string, unknown>)?.posted_by as string || 'Owner'}
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <span className="text-[11px] text-text-muted block">RERA Status</span>
                    <span className="font-medium text-xs text-text">
                      {(prediction.property_inputs as Record<string, unknown>)?.rera === 1 ? 'Approved' : 'Non-RERA'}
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                    <span className="text-[11px] text-text-muted block">Construction Status</span>
                    <span className="font-medium text-xs text-text">
                      {(prediction.property_inputs as Record<string, unknown>)?.ready_to_move === 1
                        ? 'Ready to Move'
                        : 'Under Construction'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Model & Provenance Snapshot */}
              <div className="space-y-3 pt-3 border-t border-border/80">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text">
                  Model & Geographic Context
                </h4>
                <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-surface text-xs">
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Inference Model:</span>
                    <span className="font-mono text-text">{prediction.model_name || 'HistGradientBoostingRegressor'}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Model Version Tag:</span>
                    <span className="font-mono text-text">{prediction.model_version}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Supported Geography:</span>
                    <span className="text-text">{prediction.supported_geography}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Target Currency:</span>
                    <span className="text-text">{prediction.currency} ({prediction.currency_unit})</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Record UUID:</span>
                    <span className="font-mono text-[11px] text-text-muted select-all">{prediction.id}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded bg-amber-500/5 border border-amber-500/20 text-[11px] text-text-muted leading-relaxed space-y-1">
                <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                  Decision Support Disclaimer:
                </span>
                <p>{prediction.disclaimer}</p>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
