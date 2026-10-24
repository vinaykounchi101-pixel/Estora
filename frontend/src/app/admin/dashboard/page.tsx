'use client';

/**
 * Platform Administration Dashboard
 * Displays platform-wide operational KPIs and system health status.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { apiClient } from '@/lib/api/client';
import { AdminAnalyticsSummary } from '@/types/analytics';
import { HealthReadyResponse } from '@/types/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Database,
  Cpu,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Server,
  RotateCcw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [health, setHealth] = useState<HealthReadyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const [analyticsData, healthData] = await Promise.all([
        apiClient.admin.getSystemAnalytics({ authToken: token }),
        apiClient.health.checkReady(),
      ]);
      setAnalytics(analyticsData);
      setHealth(healthData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve administrative analytics.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <AdminLayout
      title="Platform Operations Overview"
      subtitle="Operational monitoring, model artifact readiness, and aggregate platform telemetry."
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
              onClick={fetchData}
              className="gap-1.5 text-xs border-red-500/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* System Health Status Banner */}
        <div className="p-5 rounded-lg border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#47765A]/10 text-[#47765A] dark:text-[#C4CEB8] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-text">Inference & Database Status</span>
                <Badge variant="sage" className="text-[10px] py-0 px-2">
                  {health?.status === 'ready' ? 'Operational' : 'Verifying'}
                </Badge>
              </div>
              <p className="text-[11px] text-text-muted">
                PostgreSQL database: {health?.dependencies?.database || 'connected'} • Model artifact: {health?.dependencies?.model_artifacts || 'available'}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-text-muted/80">
            FastAPI v1 • HistGradientBoosting v1.0.0
          </span>
        </div>

        {/* Operational KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border border-border bg-surface p-5 space-y-1.5 shadow-xs">
            <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
              Registered Users
            </span>
            <p className="font-serif text-3xl font-medium text-text">
              {isLoading ? '—' : analytics?.total_users ?? 0}
            </p>
            <span className="text-[11px] text-text-muted">Active platform accounts</span>
          </Card>

          <Card className="border border-border bg-surface p-5 space-y-1.5 shadow-xs">
            <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
              Total Valuations
            </span>
            <p className="font-serif text-3xl font-medium text-primary">
              {isLoading ? '—' : analytics?.total_predictions ?? 0}
            </p>
            <span className="text-[11px] text-text-muted">Cumulative executed inferences</span>
          </Card>

          <Card className="border border-border bg-surface p-5 space-y-1.5 shadow-xs">
            <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
              Sale Price Valuations
            </span>
            <p className="font-serif text-3xl font-medium text-[#47765A] dark:text-[#C4CEB8]">
              {isLoading ? '—' : analytics?.sale_predictions ?? 0}
            </p>
            <span className="text-[11px] text-text-muted">Pune residential requests</span>
          </Card>

          <Card className="border border-border bg-surface p-5 space-y-1.5 shadow-xs">
            <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
              Active Models
            </span>
            <p className="font-serif text-3xl font-medium text-text">
              {isLoading ? '—' : analytics?.active_models_count ?? 1}
            </p>
            <span className="text-[11px] text-text-muted">pune_sale_v1 pipeline</span>
          </Card>
        </div>

        {/* Quick Administrative Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/admin/users" className="block group">
            <Card className="border border-border bg-surface p-6 hover:border-primary/40 transition-colors space-y-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-text group-hover:text-primary transition-colors flex items-center justify-between">
                <span>User Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Review registered accounts, role tiers, active status flags, and timestamps.
              </p>
            </Card>
          </Link>

          <Link href="/admin/predictions" className="block group">
            <Card className="border border-border bg-surface p-6 hover:border-primary/40 transition-colors space-y-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-text group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Valuation Audit Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Inspect platform-wide prediction records, input parameters, and generated estimates.
              </p>
            </Card>
          </Link>

          <Link href="/admin/models" className="block group">
            <Card className="border border-border bg-surface p-6 hover:border-primary/40 transition-colors space-y-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-text group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Model Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Inspect registered model versions, feature schemas, and cross-validation holdout metrics.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
