import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import AnalyticsPage from '@/app/(dashboard)/analytics/page';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { UserAnalyticsSummary } from '@/types/analytics';
import { PredictionResponse } from '@/types/prediction';
import { UserRead } from '@/types/auth';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/dashboard',
}));

const mockUser: UserRead = {
  id: 'usr-1',
  email: 'investor@estora.com',
  full_name: 'Vinay Kounchi',
  role: 'authenticated_user',
  is_active: true,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
};

const samplePrediction: PredictionResponse = {
  id: 'pred-901',
  user_id: 'usr-1',
  property_inputs: {
    square_ft: 1200,
    bhk_no: 2,
    latitude: 18.559,
    longitude: 73.7868,
    posted_by: 'Owner',
    address: 'Kothrud',
    rera: 1,
    ready_to_move: 1,
    resale: 0,
  },
  estimated_price_lakhs: 85.0,
  estimated_price_inr: 8500000,
  prediction_type: 'sale_price',
  model_name: 'HistGradientBoostingRegressor',
  model_version: '1.0.0',
  currency: 'INR',
  currency_unit: 'lakhs',
  disclaimer: 'Personal decision support disclaimer',
  supported_geography: 'Pune',
  created_at: '2026-10-24T10:00:00Z',
};

const mockSummary: UserAnalyticsSummary = {
  total_predictions: 1,
  sale_predictions: 1,
  rent_predictions: 0,
  average_sale_estimate_lakhs: 85.0,
  recent_predictions: [samplePrediction],
};

const mockZeroSummary: UserAnalyticsSummary = {
  total_predictions: 0,
  sale_predictions: 0,
  rent_predictions: 0,
  average_sale_estimate_lakhs: null,
  recent_predictions: [],
};

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Dashboard (/dashboard)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-mock-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockUser);
  });

  it('renders portfolio KPIs and recent activity accurately', async () => {
    vi.spyOn(apiClient.analytics, 'getUserSummary').mockResolvedValue(mockSummary);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Total Saved Valuations')).toBeInTheDocument();
    expect(screen.getAllByText('₹85.00L').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Kothrud')).toBeInTheDocument();
    expect(screen.getByText('2 BHK • 1200 sq. ft.')).toBeInTheDocument();
    expect(screen.getByText('View Snapshot').closest('a')).toHaveAttribute('href', '/predictions/pred-901');
  });

  it('renders empty zero state when user has no valuations recorded', async () => {
    vi.spyOn(apiClient.analytics, 'getUserSummary').mockResolvedValue(mockZeroSummary);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/No Valuation Activity Recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Run First Valuation/i)).toBeInTheDocument();
  });

  it('renders error notice and allows retrying summary fetch', async () => {
    let attempts = 0;
    vi.spyOn(apiClient.analytics, 'getUserSummary').mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('Analytics database unavailable.');
      }
      return mockSummary;
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Analytics database unavailable.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText('Kothrud')).toBeInTheDocument();
    expect(attempts).toBe(2);
  });
});

describe('Analytics (/analytics)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-mock-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockUser);
  });

  it('displays personal activity disclaimer and breakdown aggregations', async () => {
    vi.spyOn(apiClient.predictions, 'listUserPredictions').mockResolvedValue([
      samplePrediction,
      {
        ...samplePrediction,
        id: 'pred-902',
        property_inputs: {
          ...samplePrediction.property_inputs,
          bhk_no: 3,
          square_ft: 1800,
          address: 'Baner',
        },
        estimated_price_lakhs: 140.0,
      },
    ]);
    vi.spyOn(apiClient.analytics, 'getUserSummary').mockResolvedValue({
      ...mockSummary,
      total_predictions: 2,
      average_sale_estimate_lakhs: 112.5,
    });

    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText(/Personal Activity Disclaimer:/i)).toBeInTheDocument();
    expect(screen.getByText('BHK Configuration Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Locality Distribution')).toBeInTheDocument();
    expect(screen.getByText('2 BHK Property')).toBeInTheDocument();
    expect(screen.getByText('3 BHK Property')).toBeInTheDocument();
    expect(screen.getByText('Kothrud')).toBeInTheDocument();
    expect(screen.getByText('Baner')).toBeInTheDocument();
  });

  it('handles empty state cleanly with informative guidance and no NaNs', async () => {
    vi.spyOn(apiClient.predictions, 'listUserPredictions').mockResolvedValue([]);
    vi.spyOn(apiClient.analytics, 'getUserSummary').mockResolvedValue(mockZeroSummary);

    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText(/Insufficient Valuation Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Create First Valuation/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\bNaN\b/);
  });
});
