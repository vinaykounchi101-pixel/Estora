"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { AdminAnalyticsSummary } from "@/types/analytics";
import { Database, Filter, ShieldCheck, AlertTriangle, Layers, MapPin } from "lucide-react";

export default function AdminDatasetsPage() {
  const [liveAnalytics, setLiveAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLive() {
      try {
        const data = await apiClient.admin.getSystemAnalytics();
        setLiveAnalytics(data);
      } catch {
        // Non-blocking for static audit view
      } finally {
        setIsLoading(false);
      }
    }
    loadLive();
  }, []);

  return (
    <AdminLayout
      title="Dataset Registry & Pipeline Accounting"
      subtitle="Deterministic 5-stage cleaning pipeline and spatial partition boundary logs for Pune residential valuation."
    >
      <div className="space-y-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#B69A63] font-mono">
                Data Provenance & Governance
              </span>
              <Badge variant="outline" className="text-[10px] bg-[#B69A63]/10 text-[#B69A63] border-[#B69A63]/30">
                Audited Artifact v1.0.0
              </Badge>
            </div>
            <h1 className="font-serif text-3xl text-primary font-medium tracking-tight">
              Dataset Registry & Pipeline Accounting
            </h1>
            <p className="text-sm text-secondary mt-1">
              Deterministic 5-stage cleaning pipeline and spatial partition boundary logs for Pune residential valuation.
            </p>
          </div>
        </div>

        {/* Live System vs Static Model Boundary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-surface/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#B69A63]" />
                Static Training Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-primary">1,833</div>
              <p className="text-xs text-secondary mt-1">
                Deterministic post-filter rows from 29,050 raw listings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#B69A63]" />
                Live Persisted Valuations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-primary">
                {isLoading ? "—" : liveAnalytics?.total_predictions ?? 0}
              </div>
              <p className="text-xs text-secondary mt-1">
                Active PostgreSQL prediction records
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B69A63]" />
                Data Leakage Guard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-primary text-emerald-600 dark:text-emerald-400">
                0 Leaks
              </div>
              <p className="text-xs text-secondary mt-1">
                Spatial GroupShuffleSplit (Address + Area) verified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 5-Stage Cleaning Funnel */}
        <Card className="bg-surface/50 border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-medium text-primary flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#B69A63]" />
              Deterministic 5-Stage Preparation Funnel
            </CardTitle>
            <p className="text-xs text-secondary">
              Strict spatial, area, and valuation filtering to prevent contaminated training features.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded border border-border/50 bg-background/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#B69A63]/10 text-[#B69A63] text-xs font-mono flex items-center justify-center font-bold">1</span>
                    <h3 className="text-sm font-medium text-primary">Initial Ingestion & Address Selection</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1 ml-8">
                    Filtered national corpus to retain only Pune addresses. Dropped 27,070 non-Pune records.
                  </p>
                </div>
                <div className="text-right ml-8 md:ml-0">
                  <span className="text-sm font-mono font-medium text-primary">1,980 retained</span>
                  <span className="block text-[11px] text-secondary">from 29,050 raw</span>
                </div>
              </div>

              <div className="p-4 rounded border border-border/50 bg-background/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#B69A63]/10 text-[#B69A63] text-xs font-mono flex items-center justify-center font-bold">2</span>
                    <h3 className="text-sm font-medium text-primary">Geographic Coordinate Bounds Check</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1 ml-8">
                    Enforced latitude (17.8° - 19.3° N) and longitude (73.2° - 75.2° E). Dropped 134 corrupt coordinates.
                  </p>
                </div>
                <div className="text-right ml-8 md:ml-0">
                  <span className="text-sm font-mono font-medium text-primary">1,846 retained</span>
                  <span className="block text-[11px] text-secondary">134 excluded</span>
                </div>
              </div>

              <div className="p-4 rounded border border-border/50 bg-background/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#B69A63]/10 text-[#B69A63] text-xs font-mono flex items-center justify-center font-bold">3</span>
                    <h3 className="text-sm font-medium text-primary">Target Value Truncation</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1 ml-8">
                    Excluded non-positive values and extreme ultra-luxury outliers exceeding ₹15.00 Crore (1,500 Lakhs).
                  </p>
                </div>
                <div className="text-right ml-8 md:ml-0">
                  <span className="text-sm font-mono font-medium text-primary">1,836 retained</span>
                  <span className="block text-[11px] text-secondary">10 excluded</span>
                </div>
              </div>

              <div className="p-4 rounded border border-border/50 bg-background/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#B69A63]/10 text-[#B69A63] text-xs font-mono flex items-center justify-center font-bold">4</span>
                    <h3 className="text-sm font-medium text-primary">Area Boundary Validation</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1 ml-8">
                    Restricted livable area to 150 sq.ft – 8,000 sq.ft. Dropped 1 micro-unit and 2 non-standard plots.
                  </p>
                </div>
                <div className="text-right ml-8 md:ml-0">
                  <span className="text-sm font-mono font-medium text-primary">1,833 retained</span>
                  <span className="block text-[11px] text-secondary">3 excluded</span>
                </div>
              </div>

              <div className="p-4 rounded border border-[#B69A63]/30 bg-[#B69A63]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#B69A63] text-white text-xs font-mono flex items-center justify-center font-bold">5</span>
                    <h3 className="text-sm font-medium text-primary">Deduplication & Final Artifact Commit</h3>
                  </div>
                  <p className="text-xs text-secondary mt-1 ml-8">
                    Verified zero duplicate listings across address, area, and price. Exported clean partition.
                  </p>
                </div>
                <div className="text-right ml-8 md:ml-0">
                  <span className="text-sm font-mono font-bold text-[#B69A63]">1,833 Final Clean Rows</span>
                  <span className="block text-[11px] text-secondary">pune_sale_prices.csv</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Schema & Provenance Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-surface/50 border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-medium text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B69A63]" />
                Audited Feature Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-secondary">square_ft</span>
                  <span className="text-primary font-medium">Float (150 – 8,000)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-secondary">bhk_no</span>
                  <span className="text-primary font-medium">Integer (1 – 6)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-secondary">latitude / longitude</span>
                  <span className="text-primary font-medium">Float (Pune Bounds)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-secondary">posted_by</span>
                  <span className="text-primary font-medium">Categorical (Owner, Dealer, Builder)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-secondary">address</span>
                  <span className="text-primary font-medium">Categorical (Locality string)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-secondary">rera / ready_to_move / resale</span>
                  <span className="text-primary font-medium">Binary flag (0 / 1)</span>
                </div>
                <div className="flex justify-between py-1 pt-2 font-bold text-[#B69A63]">
                  <span>target_price_lakhs</span>
                  <span>Continuous (INR Lakhs)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-medium text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Data Provenance & Governance Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-secondary leading-relaxed">
              <p>
                <strong className="text-primary">Historical Listing Data:</strong> Training data comprises scraped web asking prices collected circa 2020. These represent asking prices at listing time rather than executed stamp-duty registration values.
              </p>
              <p>
                <strong className="text-primary">Commercial Licensing:</strong> Commercial license clearance for the underlying raw scrape archive is unresolved. Per project governance rules, this dataset is restricted strictly to academic and portfolio decision-support benchmarking.
              </p>
              <p>
                <strong className="text-primary">Data Security (SRS Section 13):</strong> Raw CSV and interim data files remain strictly gitignored and unserved by the web application. Only serialized pipeline transforms and offline metrics are exposed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
