'use client';

/**
 * Dedicated Property Valuation Studio
 * Supports verified Pune residential sale-price inference via:
 * 1. POST /api/v1/predictions (Stateful with PostgreSQL persistence when authenticated)
 * 2. POST /api/v1/predictions/sale-price (Stateless inference)
 */

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import {
  PostedByType,
  SalePropertyInputs,
  SalePriceInferenceResponse,
  PredictionResponse,
} from '@/types/prediction';
import {
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';

interface LocalityPreset {
  name: string;
  lat: number;
  lng: number;
  microMarket: string;
}

const PUNE_LOCALITIES: LocalityPreset[] = [
  { name: 'Wakad', lat: 18.5987, lng: 73.7644, microMarket: 'Wakad,Pune' },
  { name: 'Baner', lat: 18.5590, lng: 73.7868, microMarket: 'Baner,Pune' },
  { name: 'Hinjewadi', lat: 18.5913, lng: 73.7389, microMarket: 'Hinjewadi,Pune' },
  { name: 'Kothrud', lat: 18.5074, lng: 73.8077, microMarket: 'Kothrud,Pune' },
  { name: 'Hadapsar', lat: 18.5089, lng: 73.9260, microMarket: 'Hadapsar,Pune' },
  { name: 'Kharadi', lat: 18.5516, lng: 73.9348, microMarket: 'Kharadi,Pune' },
  { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143, microMarket: 'Viman Nagar,Pune' },
  { name: 'Bavdhan', lat: 18.5158, lng: 73.7819, microMarket: 'Bavdhan,Pune' },
];

export default function PredictPage() {
  const { user, token, isAuthenticated } = useAuth();
  const toast = useToast();

  // Prediction target selection (sale_price active, monthly_rent disabled)
  const [predictionTarget, setPredictionTarget] = useState<'sale_price' | 'monthly_rent'>('sale_price');

  // Form Fields
  const [selectedLocality, setSelectedLocality] = useState(PUNE_LOCALITIES[0].name);
  const [squareFt, setSquareFt] = useState('1150');
  const [bhkNo, setBhkNo] = useState('2');
  const [postedBy, setPostedBy] = useState<PostedByType>('Owner');
  const [rera, setRera] = useState<'1' | '0'>('1');
  const [readyToMove, setReadyToMove] = useState<'1' | '0'>('1');
  const [resale, setResale] = useState<'1' | '0'>('0');
  const [saveToHistory, setSaveToHistory] = useState(true);

  // States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState<SalePriceInferenceResponse | PredictionResponse | null>(null);
  const [isPersisted, setIsPersisted] = useState(false);

  const handleLocalityChange = (locName: string) => {
    setSelectedLocality(locName);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const area = parseFloat(squareFt);
    if (isNaN(area)) {
      errors.squareFt = 'Area must be a valid number.';
    } else if (area < 150 || area > 8000) {
      errors.squareFt = 'Area must be between 150 and 8,000 sq. ft. per model envelope.';
    }

    const bhk = parseInt(bhkNo, 10);
    if (isNaN(bhk) || bhk < 1 || bhk > 10) {
      errors.bhkNo = 'Bedrooms must be between 1 and 10 BHK.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (predictionTarget === 'monthly_rent') {
      setGeneralError('Monthly rent prediction is currently unavailable while rental training datasets remain in audit.');
      return;
    }

    if (!validate()) return;

    const locality = PUNE_LOCALITIES.find((l) => l.name === selectedLocality) || PUNE_LOCALITIES[0];

    const propertyPayload: SalePropertyInputs = {
      square_ft: parseFloat(squareFt),
      bhk_no: parseInt(bhkNo, 10),
      latitude: locality.lat,
      longitude: locality.lng,
      posted_by: postedBy,
      address: locality.microMarket,
      rera: rera === '1' ? 1 : 0,
      ready_to_move: readyToMove === '1' ? 1 : 0,
      resale: resale === '1' ? 1 : 0,
    };

    setIsLoading(true);
    setIsPersisted(false);

    try {
      if (isAuthenticated && saveToHistory) {
        // Stateful flow: Persist snapshot to database
        const result = await apiClient.predictions.createPrediction(
          {
            prediction_type: 'sale_price',
            property_inputs: propertyPayload,
          },
          { authToken: token }
        );
        setEstimateResult(result);
        setIsPersisted(true);
        toast.success('Valuation calculated and saved to your history.');
      } else {
        // Stateless flow: Fast ML inference without saving
        const result = await apiClient.predictions.predictSalePrice(propertyPayload);
        setEstimateResult(result);
        setIsPersisted(false);
        toast.info('Valuation calculated.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inference request failed. Please verify input values.';
      setGeneralError(msg);
      toast.error('Unable to compute valuation.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPriceLakhs = (lakhs: number) => {
    return `₹${lakhs.toFixed(2)} Lakhs`;
  };

  const formatDerivedInr = (lakhs: number) => {
    const inr = Math.round(lakhs * 100000);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  return (
    <DashboardLayout
      title="Property Valuation Studio"
      subtitle="Execute validated ML inference on residential properties with real-time model verification."
      requireAuth={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Valuation Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border bg-surface p-6 sm:p-8 shadow-xs">
            {/* Target Selector */}
            <div className="mb-6 space-y-2">
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-medium">
                Prediction Target Domain
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPredictionTarget('sale_price')}
                  className={`p-3 rounded-lg border text-left transition-all text-xs font-medium ${
                    predictionTarget === 'sale_price'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-border text-text-muted hover:border-text-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-text">Sale Price</span>
                    <Badge variant="sage" className="text-[10px] py-0 px-1.5">
                      Active
                    </Badge>
                  </div>
                  <span className="text-[11px] text-text-muted block">
                    Pune primary residential capital value
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.info('Monthly rent models are under dataset audit per SRS FR-PRED-001.');
                  }}
                  className="p-3 rounded-lg border border-border/60 bg-surface-raised/40 text-left text-xs opacity-75 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-text-muted">Monthly Rent</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-text-muted border-border">
                      In Audit
                    </Badge>
                  </div>
                  <span className="text-[11px] text-text-muted/80 block">
                    Rental yield model deferred in Phase 6
                  </span>
                </button>
              </div>
            </div>

            {generalError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start gap-3 leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
              {/* Locality Preset */}
              <FormField
                label="Pune Locality / Micro-Market"
                htmlFor="preset-locality"
                hint="Verified coordinates within [17.90, 19.30] N, [73.20, 75.30] E"
              >
                <Select
                  id="preset-locality"
                  value={selectedLocality}
                  onChange={(e) => handleLocalityChange(e.target.value)}
                  disabled={isLoading}
                >
                  {PUNE_LOCALITIES.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} ({loc.microMarket})
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Area & BHK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Built-Up Area (Sq. Ft.)"
                  htmlFor="input-square-ft"
                  error={fieldErrors.squareFt}
                  hint="Range: 150 to 8,000 sq ft"
                  required
                >
                  <Input
                    id="input-square-ft"
                    type="number"
                    min={150}
                    max={8000}
                    step={10}
                    value={squareFt}
                    onChange={(e) => setSquareFt(e.target.value)}
                    disabled={isLoading}
                    className="text-xs"
                  />
                </FormField>

                <FormField
                  label="Bedrooms (BHK Count)"
                  htmlFor="input-bhk"
                  error={fieldErrors.bhkNo}
                  hint="Range: 1 to 10 BHK"
                  required
                >
                  <Select
                    id="input-bhk"
                    value={bhkNo}
                    onChange={(e) => setBhkNo(e.target.value)}
                    disabled={isLoading}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num.toString()}>
                        {num} BHK Configuration
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              {/* Entity & Construction Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Listed Entity" htmlFor="select-posted-by">
                  <Select
                    id="select-posted-by"
                    value={postedBy}
                    onChange={(e) => setPostedBy(e.target.value as PostedByType)}
                    disabled={isLoading}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Builder">Builder</option>
                  </Select>
                </FormField>

                <FormField label="RERA Approved" htmlFor="select-rera">
                  <Select
                    id="select-rera"
                    value={rera}
                    onChange={(e) => setRera(e.target.value as '1' | '0')}
                    disabled={isLoading}
                  >
                    <option value="1">RERA Registered (1)</option>
                    <option value="0">Non-RERA (0)</option>
                  </Select>
                </FormField>

                <FormField label="Construction Status" htmlFor="select-status">
                  <Select
                    id="select-status"
                    value={readyToMove}
                    onChange={(e) => setReadyToMove(e.target.value as '1' | '0')}
                    disabled={isLoading}
                  >
                    <option value="1">Ready to Move</option>
                    <option value="0">Under Construction</option>
                  </Select>
                </FormField>
              </div>

              {/* Transaction Nature */}
              <FormField label="Transaction Nature" htmlFor="select-resale">
                <Select
                  id="select-resale"
                  value={resale}
                  onChange={(e) => setResale(e.target.value as '1' | '0')}
                  disabled={isLoading}
                >
                  <option value="0">New Launch / Booking (0)</option>
                  <option value="1">Resale Property (1)</option>
                </Select>
              </FormField>

              {/* Persistence Checkbox (Only if authenticated) */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="save-to-history"
                    checked={saveToHistory}
                    onChange={(e) => setSaveToHistory(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-focus"
                    disabled={isLoading}
                  />
                  <label htmlFor="save-to-history" className="text-xs text-text-muted select-none cursor-pointer">
                    Save this valuation snapshot to my private history
                  </label>
                </div>
              )}

              {/* Submission Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center gap-2 py-3 text-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Executing HistGradientBoosting Inference...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sage" />
                    <span>Generate Valuation Estimate</span>
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Valuation Results & Provenance Card */}
        <div className="lg:col-span-5 space-y-6">
          {estimateResult ? (
            <Card className="border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-sans text-text-muted uppercase tracking-wider font-medium">
                    Inference Output
                  </span>
                  <h3 className="font-serif text-xl font-medium text-text">Valuation Estimate</h3>
                </div>
                {isPersisted ? (
                  <Badge variant="sage" className="gap-1 text-[10px]">
                    <BookmarkCheck className="w-3 h-3" />
                    <span>Saved to History</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-text-muted border-border">
                    Stateless Estimate
                  </Badge>
                )}
              </div>

              {/* Price Figures */}
              <div className="p-5 rounded-lg bg-surface-raised/60 border border-border/80 space-y-2">
                <span className="text-xs text-text-muted font-sans uppercase tracking-wider">
                  Estimated Property Value
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-primary">
                    {formatPriceLakhs(estimateResult.estimated_price_lakhs)}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({formatDerivedInr(estimateResult.estimated_price_lakhs)})
                  </span>
                </div>
                <p className="text-[11px] text-text-muted/80">
                  Target currency: Indian Rupees (INR)
                </p>
              </div>

              {/* Model Provenance Snapshot */}
              <div className="space-y-2.5 text-xs">
                <span className="font-semibold text-text uppercase tracking-wider text-[11px] block">
                  Model Audit Attributes
                </span>
                <div className="divide-y divide-border/60 rounded border border-border/60 bg-surface">
                  {estimateResult.model_name && (
                    <div className="p-2.5 flex justify-between">
                      <span className="text-text-muted">Model:</span>
                      <span className="font-mono text-text">{estimateResult.model_name}</span>
                    </div>
                  )}
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Model Version:</span>
                    <span className="font-mono text-text">{estimateResult.model_version}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Geography:</span>
                    <span className="text-text">{estimateResult.supported_geography}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-text-muted">Target Domain:</span>
                    <span className="capitalize text-text">{estimateResult.prediction_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Decision Support Disclaimer */}
              <div className="p-3.5 rounded bg-amber-500/5 border border-amber-500/20 text-[11px] text-text-muted leading-relaxed space-y-1">
                <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                  Decision Support Notice:
                </span>
                <p>{estimateResult.disclaimer}</p>
              </div>

              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-xs"
                onClick={() => setEstimateResult(null)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Valuation Calculator</span>
              </Button>
            </Card>
          ) : (
            <Card className="border border-border/80 bg-surface/50 p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-border/80 pb-4">
                <h3 className="font-serif text-xl font-medium text-text">Valuation Standards & Integrity</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Rigorous empirical validation parameters governing Pune residential price estimates.
                </p>
              </div>

              <div className="space-y-4 text-xs text-text-muted leading-relaxed">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block mb-0.5">HistGradientBoosting Champion Pipeline:</strong>
                    Trained on 1,833 audited Pune residential records, learning complex non-linear attribute interactions without target leakage.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block mb-0.5">Spatial GroupKFold Cross-Validation:</strong>
                    5-fold cross-validation partitioned by micro-market centroid yields a mean validation MAE of <span className="font-semibold text-text">₹16.07 Lakhs</span> (±₹0.98L).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block mb-0.5">Frozen 20% Held-Out Test Evaluation:</strong>
                    Held-out test partition verified with <span className="font-semibold text-text">MAE ₹17.35 Lakhs</span>, RMSE ₹40.71 Lakhs, and <span className="font-semibold text-text">R² 0.807</span> variance explained.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block mb-0.5">Micro-Market Spatial Bounding:</strong>
                    Enforces strict geographic coordinates (17.9°–19.3° N, 73.2°–75.3° E), rejecting out-of-scope localities.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#47765A] dark:text-[#C4CEB8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block mb-0.5">Inference Latency & Price Semantics:</strong>
                    Sub-10ms model execution (~6.6ms mean). Reflects historical circa-2020 listing asking prices for decision-support rather than legal registered deeds.
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
