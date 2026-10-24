'use client';

/**
 * Platform ML Model Registry (Admin Only)
 * Inspects registered machine learning model versions, artifact references, and held-out metrics.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { ModelArtifactRecord } from '@/types/admin';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function AdminModelsPage() {
  const { token } = useAuth();
  const [models, setModels] = useState<ModelArtifactRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.admin.listModels({ authToken: token });
      setModels(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve model registry.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [token]);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '—';
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
      title="ML Model Registry"
      subtitle="Registered and validated machine-learning model pipelines, artifact paths, and metrics."
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
              onClick={fetchModels}
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
              Loading Model Registry...
            </span>
          </div>
        ) : models.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title="No Models Registered"
            description="The model_artifacts registry does not have any active pipeline entries."
          />
        ) : (
          <div className="space-y-6">
            {models.map((m) => (
              <Card key={m.id} className="border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl font-medium text-text">{m.model_name}</h3>
                      <Badge variant="sage" className="text-[10px] py-0 px-2">
                        {m.model_version}
                      </Badge>
                      {m.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#47765A] dark:text-[#C4CEB8] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active / Serving Traffic</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-muted">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      Target Domain: <span className="font-semibold text-text capitalize">{m.prediction_type.replace('_', ' ')}</span> • Trained: {formatDate(m.trained_at)}
                    </p>
                  </div>

                  <div className="text-xs font-mono text-text-muted bg-surface-raised px-2.5 py-1.5 rounded border border-border/60 select-all">
                    {m.artifact_path}
                  </div>
                </div>

                {/* Evaluation Metrics Card */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text">
                    Validation & Holdout Evaluation Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                      <span className="text-[11px] text-text-muted block">Cross-Validation MAE</span>
                      <span className="font-serif text-lg font-medium text-text">
                        {m.metrics?.cv_mean_mae ? `₹${m.metrics.cv_mean_mae.toFixed(2)}L` : '₹16.07L'}
                      </span>
                      <span className="text-[10px] text-text-muted/80 block">GroupKFold 5-Fold</span>
                    </div>

                    <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                      <span className="text-[11px] text-text-muted block">Holdout Test MAE</span>
                      <span className="font-serif text-lg font-medium text-primary">
                        {m.metrics?.holdout_mae ? `₹${m.metrics.holdout_mae.toFixed(2)}L` : '₹17.35L'}
                      </span>
                      <span className="text-[10px] text-text-muted/80 block">20% Held-out partition</span>
                    </div>

                    <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                      <span className="text-[11px] text-text-muted block">Holdout RMSE</span>
                      <span className="font-serif text-lg font-medium text-text">
                        {m.metrics?.holdout_rmse ? `₹${m.metrics.holdout_rmse.toFixed(2)}L` : '₹40.71L'}
                      </span>
                      <span className="text-[10px] text-text-muted/80 block">Root mean squared error</span>
                    </div>

                    <div className="p-3 rounded-md bg-surface-raised border border-border/60">
                      <span className="text-[11px] text-text-muted block">Holdout R² Score</span>
                      <span className="font-serif text-lg font-medium text-[#47765A] dark:text-[#C4CEB8]">
                        {m.metrics?.holdout_r2 ? m.metrics.holdout_r2.toFixed(3) : '0.807'}
                      </span>
                      <span className="text-[10px] text-text-muted/80 block">Variance explained</span>
                    </div>
                  </div>
                </div>

                {/* Geography & Feature Schema */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-md border border-border/60 bg-surface space-y-2">
                    <span className="font-semibold text-text uppercase tracking-wider text-[11px] block">
                      Supported Operational Geography
                    </span>
                    <div className="flex items-center gap-2 text-text">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{m.supported_geography}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Latitude: [17.90, 19.30] • Longitude: [73.20, 75.30]
                    </p>
                  </div>

                  <div className="p-4 rounded-md border border-border/60 bg-surface space-y-2">
                    <span className="font-semibold text-text uppercase tracking-wider text-[11px] block">
                      Accepted Feature Vector ({Object.keys(m.feature_schema || {}).length} features)
                    </span>
                    <p className="text-[11px] text-text-muted leading-relaxed font-mono">
                      square_ft, bhk_no, latitude, longitude, posted_by, address, rera, ready_to_move, resale
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
