'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { formatErrorMessage } from '@/lib/api/errors';
import { SalePriceInferenceResponse, PostedByType } from '@/types/prediction';
import { Sparkles, MapPin, AlertCircle, Info, RefreshCw } from 'lucide-react';

const POPULAR_LOCALITIES = [
  { name: 'Kothrud, Pune', lat: 18.5074, lon: 73.8077 },
  { name: 'Wakad, Pune', lat: 18.5987, lon: 73.7688 },
  { name: 'Baner, Pune', lat: 18.5590, lon: 73.7868 },
  { name: 'Hinjewadi, Pune', lat: 18.5913, lon: 73.7389 },
  { name: 'Viman Nagar, Pune', lat: 18.5679, lon: 73.9143 },
  { name: 'Kalyani Nagar, Pune', lat: 18.5463, lon: 73.9034 },
  { name: 'Hadapsar, Pune', lat: 18.5089, lon: 73.9259 },
  { name: 'Aundh, Pune', lat: 18.5602, lon: 73.8031 },
  { name: 'Kharadi, Pune', lat: 18.5516, lon: 73.9349 },
];

export function QuickValuationCard() {
  const [squareFt, setSquareFt] = useState('1150');
  const [bhkNo, setBhkNo] = useState('2');
  const [localityIndex, setLocalityIndex] = useState('0');
  const [postedBy, setPostedBy] = useState<PostedByType>('Owner');
  const [isRera, setIsRera] = useState('1');
  const [readyToMove, setReadyToMove] = useState('1');
  const [resale, setResale] = useState('0');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SalePriceInferenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const selectedLocality = POPULAR_LOCALITIES[parseInt(localityIndex, 10)] || POPULAR_LOCALITIES[0];
    const sqFtNum = parseFloat(squareFt);
    const bhkNum = parseInt(bhkNo, 10);

    if (isNaN(sqFtNum) || sqFtNum < 200 || sqFtNum > 8000) {
      setError('Built-up area must be between 200 and 8,000 sq ft.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.predictions.predictSalePrice({
        square_ft: sqFtNum,
        bhk_no: bhkNum,
        latitude: selectedLocality.lat,
        longitude: selectedLocality.lon,
        posted_by: postedBy,
        address: selectedLocality.name,
        rera: parseInt(isRera, 10) as 0 | 1,
        ready_to_move: parseInt(readyToMove, 10) as 0 | 1,
        resale: parseInt(resale, 10) as 0 | 1,
      });
      setResult(response);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-xl mx-auto border border-border/80 shadow-md backdrop-blur-sm bg-surface/95 transition-all">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl sm:text-2xl text-text font-medium tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sage dark:text-bronze" />
              <span>Instant Property Valuation</span>
            </h3>
            <p className="text-xs text-text-muted">
              Live inference via approved Pune HistGradientBoosting model (v1.0.0)
            </p>
          </div>
          <Badge variant="sage" className="hidden sm:inline-flex text-[11px]">
            Pune Market
          </Badge>
        </div>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/10 p-4 text-xs text-danger flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Valuation Request Notice</p>
              <p className="text-danger/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {result ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-lg bg-black/5 dark:bg-white/5 border border-border p-6 text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Estimated Residential Market Value
              </span>
              <div className="font-serif text-4xl sm:text-5xl font-medium text-text">
                ₹ {result.estimated_price_lakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Lakhs
              </div>
              <p className="text-xs text-text-muted">
                Approx. ₹ {result.estimated_price_inr.toLocaleString('en-IN')} (Target: Sale Price)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-border p-3 space-y-1 bg-surface">
                <span className="text-text-muted">Model Pipeline</span>
                <p className="font-medium text-text">{result.model_name} (v{result.model_version})</p>
              </div>
              <div className="rounded-md border border-border p-3 space-y-1 bg-surface">
                <span className="text-text-muted">Geography</span>
                <p className="font-medium text-text">Pune Urban Micro-Markets</p>
              </div>
            </div>

            <div className="rounded-md bg-stone/5 border border-border p-3.5 flex items-start gap-2.5 text-[11px] text-text-muted leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-sage dark:text-bronze" />
              <span>{result.disclaimer}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Evaluate Another Property</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEstimate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Micro-Market / Locality"
                value={localityIndex}
                onChange={(e) => setLocalityIndex(e.target.value)}
              >
                {POPULAR_LOCALITIES.map((loc, idx) => (
                  <option key={loc.name} value={idx}>
                    {loc.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Configuration"
                value={bhkNo}
                onChange={(e) => setBhkNo(e.target.value)}
              >
                <option value="1">1 BHK Apartment</option>
                <option value="2">2 BHK Apartment</option>
                <option value="3">3 BHK Apartment</option>
                <option value="4">4 BHK Apartment</option>
                <option value="5">5+ BHK Luxury Unit</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Built-up Area (Sq Ft)"
                type="number"
                min="200"
                max="8000"
                value={squareFt}
                onChange={(e) => setSquareFt(e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
                hint="Typical 2BHK: 900 - 1,300 sq ft"
              />

              <Select
                label="Listing Origin"
                value={postedBy}
                onChange={(e) => setPostedBy(e.target.value as PostedByType)}
              >
                <option value="Owner">Direct Owner</option>
                <option value="Dealer">Licensed Broker / Dealer</option>
                <option value="Builder">Original Builder / Developer</option>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <Select
                label="RERA Status"
                value={isRera}
                onChange={(e) => setIsRera(e.target.value)}
              >
                <option value="1">RERA Approved</option>
                <option value="0">Non-RERA / Unregistered</option>
              </Select>

              <Select
                label="Possession"
                value={readyToMove}
                onChange={(e) => setReadyToMove(e.target.value)}
              >
                <option value="1">Ready to Move</option>
                <option value="0">Under Construction</option>
              </Select>

              <Select
                label="Property Class"
                value={resale}
                onChange={(e) => setResale(e.target.value)}
              >
                <option value="0">New Launch</option>
                <option value="1">Resale</option>
              </Select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-center text-sm shadow-sm"
              >
                Calculate Valuation Estimate
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
