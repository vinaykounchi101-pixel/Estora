"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Award, FileText, CheckCircle2, TrendingUp, Cpu } from "lucide-react";

export default function AdminReportsPage() {
  const modelComparisons = [
    {
      name: "Dummy Median Regressor",
      type: "Heuristic Baseline",
      trainMae: "₹42.14L",
      testMae: "₹51.21L",
      testRmse: "₹97.67L",
      testR2: "-0.113",
      selected: false,
      notes: "Predicts median price across all properties without feature weighting."
    },
    {
      name: "Ridge Regression (log1p target)",
      type: "Linear L2 Regularized",
      trainMae: "₹16.05L",
      testMae: "₹19.08L",
      testRmse: "₹40.38L",
      testR2: "0.810",
      selected: false,
      notes: "Log1p transformation controls right-skewed property valuation distribution."
    },
    {
      name: "Random Forest (100 trees, d=15)",
      type: "Ensemble Bagging",
      trainMae: "₹7.54L",
      testMae: "₹18.31L",
      testRmse: "₹44.09L",
      testR2: "0.773",
      selected: false,
      notes: "Strong training fit, noticeable generalization gap on held-out test partition."
    },
    {
      name: "HistGradientBoostingRegressor (v1.0.0)",
      type: "Gradient Boosted Trees",
      trainMae: "₹11.36L",
      testMae: "₹17.35L",
      testRmse: "₹40.71L",
      testR2: "0.807",
      selected: true,
      notes: "Production Champion. Lowest holdout error and robust handling of high-cardinality localities."
    }
  ];

  return (
    <AdminLayout
      title="Model Evaluation & Benchmark Comparison"
      subtitle="Offline validation audit comparing heuristic baseline against candidate regressors on held-out test data."
    >
      <div className="space-y-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#B69A63] font-mono">
                Model Evaluation Reports
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Audited Benchmark Run
              </Badge>
            </div>
            <h1 className="font-serif text-3xl text-primary font-medium tracking-tight">
              Model Evaluation & Benchmark Comparison
            </h1>
            <p className="text-sm text-secondary mt-1">
              Offline validation audit comparing heuristic baseline against candidate regressors on held-out test data.
            </p>
          </div>
        </div>

        {/* Champion Model Metrics Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-surface/50 border-[#B69A63]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#B69A63]" />
                Champion Holdout MAE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-[#B69A63]">₹17.35L</div>
              <p className="text-xs text-secondary mt-1">Held-out test error (365 records)</p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#B69A63]" />
                Champion Holdout R²
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-primary">0.807</div>
              <p className="text-xs text-secondary mt-1">Explains ~80.7% of price variance</p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#B69A63]" />
                Holdout RMSE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-primary">₹40.71L</div>
              <p className="text-xs text-secondary mt-1">Penalizes large luxury valuation errors</p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#B69A63]" />
                Median Absolute Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-medium text-primary">₹8.41L</div>
              <p className="text-xs text-secondary mt-1">Median error across residential properties</p>
            </CardContent>
          </Card>
        </div>

        {/* Model Benchmark Comparison Table */}
        <Card className="bg-surface/50 border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-medium text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B69A63]" />
              Candidate Regressors Evaluation Matrix
            </CardTitle>
            <p className="text-xs text-secondary">
              Trained on 1,468 rows (80.1%) and evaluated on 365 held-out rows (19.9%) using GroupShuffleSplit without cross-partition group leakage.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/60">
                    <TableHead className="font-mono text-xs uppercase">Model</TableHead>
                    <TableHead className="font-mono text-xs uppercase">Architecture</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Train MAE</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Test MAE</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Test RMSE</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Test R²</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelComparisons.map((model) => (
                    <TableRow key={model.name} className={model.selected ? "bg-[#B69A63]/5 font-medium" : ""}>
                      <TableCell className="text-xs font-medium text-primary">
                        {model.name}
                        <span className="block text-[11px] text-secondary font-normal mt-0.5">{model.notes}</span>
                      </TableCell>
                      <TableCell className="text-xs text-secondary">{model.type}</TableCell>
                      <TableCell className="text-xs font-mono text-right text-secondary">{model.trainMae}</TableCell>
                      <TableCell className="text-xs font-mono text-right font-medium text-primary">{model.testMae}</TableCell>
                      <TableCell className="text-xs font-mono text-right text-secondary">{model.testRmse}</TableCell>
                      <TableCell className="text-xs font-mono text-right text-primary">{model.testR2}</TableCell>
                      <TableCell className="text-center">
                        {model.selected ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Production
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-secondary font-mono">Benchmark</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Validation Protocol & Methodology Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-surface/50 border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-medium text-primary">
                Partitioning & Leakage Prevention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-secondary leading-relaxed">
              <p>
                <strong className="text-primary">Group Definition:</strong> Partition grouping is keyed on <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded border border-border/50">[address, square_ft_rounded_1dec]</code>, grouping multiple listings of identical apartment typologies within the same complex into the same partition.
              </p>
              <p>
                <strong className="text-primary">Partition Integrity:</strong> 1,788 unique groups across 1,833 total listings. Exactly 0 overlapping groups were detected between the training partition (1,468 rows, 1,430 groups) and held-out evaluation partition (365 rows, 358 groups).
              </p>
              <p>
                <strong className="text-primary">Cross-Validation:</strong> 5-fold spatial GroupKFold achieved a cross-validation MAE of ₹16.07L ± ₹0.98L, verifying model stability across Pune micro-markets.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-border/60">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-medium text-primary">
                Audit & Governance Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-secondary leading-relaxed">
              <p>
                <strong className="text-primary">No Fabricated Accuracies:</strong> Per project rules, Estora never reports arbitrary &quot;accuracy percentages&quot; for continuous property price regression. Model precision is reported strictly through MAE, RMSE, MedAE, and R².
              </p>
              <p>
                <strong className="text-primary">Price Semantics:</strong> Estimates represent expected listing asking prices (circa 2020 base). They do not account for negotiations, closing discounts, stamp-duty registration fees, or 2026 inflation adjustments.
              </p>
              <p>
                <strong className="text-primary">Rental Target Status:</strong> Monthly rental prediction workflow is disabled and remains quarantined pending separate audited rental contract collection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
