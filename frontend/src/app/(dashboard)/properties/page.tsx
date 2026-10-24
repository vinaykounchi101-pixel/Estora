import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bookmark,
  Calendar,
  Layers,
  Calculator,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PropertiesPage() {
  return (
    <DashboardLayout
      title="Saved Properties"
      subtitle="Property portfolio management and asset bookmarking catalog."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border border-border bg-surface p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <Bookmark className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 mb-1">
              <Badge variant="outline" className="text-[10px] py-0.5 border-border">
                Roadmap Feature (Phase P2)
              </Badge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-text">
              Property Portfolio Bookmarking Coming Soon
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-md mx-auto">
              In accordance with project specifications, the core Phase A and B MVP focuses on validated
              ML price inference and historical snapshot persistence. Persistent property listing bookmarking
              and portfolio clustering are scheduled for Phase P2.
            </p>
          </div>

          <div className="p-4 rounded-md bg-surface-raised border border-border/80 text-left text-xs text-text-muted space-y-2 max-w-lg mx-auto">
            <span className="font-medium text-text block">Planned Phase P2 Capabilities:</span>
            <ul className="space-y-1.5 list-disc list-inside text-[11px]">
              <li>Save external property listings with automated Pune valuation benchmarking</li>
              <li>Track market appreciation estimates over 6-month and 12-month intervals</li>
              <li>Portfolio equity estimation with custom loan-to-value calculations</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/predict" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto justify-center gap-2 text-xs">
                <Calculator className="w-3.5 h-3.5" />
                <span>Open Valuation Studio</span>
              </Button>
            </Link>
            <Link href="/predictions" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center gap-2 text-xs">
                <span>View Valuation History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
