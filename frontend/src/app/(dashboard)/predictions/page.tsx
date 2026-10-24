'use client';

/**
 * Historical Valuations Listing Page
 * Retrieves and paginates historical valuation snapshots authored by the authenticated user.
 */

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { PredictionResponse } from '@/types/prediction';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  History,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  AlertTriangle,
  Building2,
  Calendar,
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function PredictionsHistoryPage() {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(async (pageIndex: number) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const skip = pageIndex * PAGE_SIZE;
      const data = await apiClient.predictions.listUserPredictions(
        { skip, limit: PAGE_SIZE + 1 },
        { authToken: token }
      );

      if (data.length > PAGE_SIZE) {
        setHasMore(true);
        setPredictions(data.slice(0, PAGE_SIZE));
      } else {
        setHasMore(false);
        setPredictions(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to retrieve prediction history.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <DashboardLayout
      title="Valuation History"
      subtitle="Review and audit your historical residential property valuations."
      action={
        <Link href="/predict">
          <Button variant="primary" size="sm" className="gap-2 text-xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>New Valuation</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
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
              onClick={() => fetchHistory(page)}
              className="gap-1.5 text-xs border-red-500/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Loading Valuation History...
            </span>
          </div>
        ) : predictions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Valuations Recorded"
            description="You have not generated any property valuations yet. Launch the studio to run your first valuation."
            action={
              <Link href="/predict">
                <Button variant="primary" size="sm" className="gap-2 text-xs">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Launch Valuation Studio</span>
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Locality</TableHead>
                    <TableHead>Specification</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Valuation Estimate</TableHead>
                    <TableHead>Model Version</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((p) => {
                    const inputs = p.property_inputs as Record<string, unknown>;
                    const locality = (inputs?.address as string) || p.supported_geography || 'Pune';
                    const bhk = inputs?.bhk_no != null ? String(inputs.bhk_no) : '—';
                    const sqft = inputs?.square_ft != null ? String(inputs.square_ft) : '—';

                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs text-text-muted whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </TableCell>
                        <TableCell className="font-medium text-text">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span>{locality}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-text-muted">
                          {bhk} BHK • {sqft} sq. ft.
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {p.prediction_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-serif text-base font-medium text-primary whitespace-nowrap">
                          ₹{p.estimated_price_lakhs.toFixed(2)} Lakhs
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted">
                          {p.model_version}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/predictions/${p.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs py-1 px-2.5">
                              <Eye className="w-3 h-3 text-text-muted" />
                              <span>Details</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-text-muted">
                Page {page + 1}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isLoading}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
                  className="gap-1 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
