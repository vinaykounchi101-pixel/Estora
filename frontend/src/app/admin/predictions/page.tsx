'use client';

/**
 * Platform Valuation Audit Log (Admin Only)
 * Retrieves paginated audit log of all property valuation estimates submitted across the system.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { PredictionResponse } from '@/types/prediction';
import { AdminLayout } from '@/components/layout/admin-layout';
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Database, ChevronLeft, ChevronRight, AlertTriangle, RotateCcw, Building2 } from 'lucide-react';

const PAGE_SIZE = 15;

export default function AdminPredictionsPage() {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchPredictions = useCallback(async (pageIndex: number) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const skip = pageIndex * PAGE_SIZE;
      const data = await apiClient.admin.listPredictions(
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
      const msg = err instanceof Error ? err.message : 'Failed to retrieve valuation audit log.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPredictions(page);
  }, [fetchPredictions, page]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AdminLayout
      title="Valuation Audit Log"
      subtitle="Complete system-wide audit record of all executed residential valuations."
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
              onClick={() => fetchPredictions(page)}
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
              Loading Audit Records...
            </span>
          </div>
        ) : predictions.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No Valuations Recorded"
            description="The platform database does not currently have any valuation records."
          />
        ) : (
          <div className="space-y-4">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Locality</TableHead>
                    <TableHead>Specifications</TableHead>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Model Version</TableHead>
                    <TableHead>Prediction UUID</TableHead>
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
                        <TableCell className="text-xs">
                          {p.user_id ? (
                            <span className="font-mono text-[11px] text-text">User: {p.user_id.slice(0, 8)}...</span>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-text-muted border-border">
                              Anonymous
                            </Badge>
                          )}
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
                        <TableCell className="font-serif text-sm font-medium text-primary whitespace-nowrap">
                          ₹{p.estimated_price_lakhs.toFixed(2)}L
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted">
                          {p.model_version}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted select-all">
                          {p.id}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-text-muted">Page {page + 1}</span>
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
    </AdminLayout>
  );
}
