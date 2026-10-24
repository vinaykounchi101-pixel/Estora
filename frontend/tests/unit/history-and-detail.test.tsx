import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PredictionsHistoryPage from '@/app/(dashboard)/predictions/page';
import PredictionDetailPage from '@/app/(dashboard)/predictions/[id]/page';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { PredictionResponse } from '@/types/prediction';
import { UserRead } from '@/types/auth';
import { NotFoundError } from '@/lib/api/errors';

const { mockRouteParams } = vi.hoisted(() => ({
  mockRouteParams: { id: 'pred-101' },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => mockRouteParams,
  usePathname: () => '/predictions',
}));

const mockUser: UserRead = {
  id: 'usr-1',
  email: 'test@estora.com',
  full_name: 'Test User',
  role: 'authenticated_user',
  is_active: true,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
};

const samplePrediction: PredictionResponse = {
  id: 'pred-101',
  user_id: 'usr-1',
  property_inputs: {
    square_ft: 1450,
    bhk_no: 3,
    latitude: 18.559,
    longitude: 73.7868,
    posted_by: 'Owner',
    address: 'Baner',
    rera: 1,
    ready_to_move: 1,
    resale: 0,
  },
  estimated_price_lakhs: 115.5,
  estimated_price_inr: 11550000,
  prediction_type: 'sale_price',
  model_name: 'HistGradientBoostingRegressor',
  model_version: '1.0.0',
  currency: 'INR',
  currency_unit: 'lakhs',
  disclaimer: 'Decision support disclaimer',
  supported_geography: 'Pune',
  created_at: '2026-10-24T12:00:00Z',
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

describe('Predictions History (/predictions)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-mock-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockUser);
  });

  it('renders empty state when user has no saved valuations', async () => {
    vi.spyOn(apiClient.predictions, 'listUserPredictions').mockResolvedValue([]);

    renderWithProviders(<PredictionsHistoryPage />);

    expect(await screen.findByText(/No Valuations Recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Launch Valuation Studio/i)).toBeInTheDocument();
  });

  it('renders table of saved predictions with location, bhk, and estimate', async () => {
    vi.spyOn(apiClient.predictions, 'listUserPredictions').mockResolvedValue([samplePrediction]);

    renderWithProviders(<PredictionsHistoryPage />);

    expect(await screen.findByText('Baner')).toBeInTheDocument();
    expect(screen.getByText('3 BHK • 1450 sq. ft.')).toBeInTheDocument();
    expect(screen.getByText('₹115.50 Lakhs')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('handles pagination next and fetches page 1 with skip=10', async () => {
    const mockEleven = Array.from({ length: 11 }, (_, i) => ({
      ...samplePrediction,
      id: `pred-${i}`,
    }));

    const listSpy = vi
      .spyOn(apiClient.predictions, 'listUserPredictions')
      .mockResolvedValueOnce(mockEleven)
      .mockResolvedValue([samplePrediction]);

    renderWithProviders(<PredictionsHistoryPage />);

    const nextBtn = await screen.findByRole('button', { name: /Next/i });
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, limit: 11 }),
        expect.anything()
      );
    });
  });

  it('renders error state and retries on failure', async () => {
    let callCount = 0;
    const listSpy = vi
      .spyOn(apiClient.predictions, 'listUserPredictions')
      .mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error loading history.');
        }
        return [samplePrediction];
      });

    renderWithProviders(<PredictionsHistoryPage />);

    expect(await screen.findByText('Network error loading history.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText('Baner')).toBeInTheDocument();
    expect(listSpy).toHaveBeenCalledTimes(2);
  });
});

describe('Prediction Detail Page (/predictions/[id])', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockRouteParams.id = 'pred-101';
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-mock-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockUser);
  });

  it('fetches and displays full prediction snapshot by ID', async () => {
    vi.spyOn(apiClient.predictions, 'getPredictionDetail').mockResolvedValue(samplePrediction);

    renderWithProviders(<PredictionDetailPage />);

    expect(await screen.findByText('₹115.50 Lakhs')).toBeInTheDocument();
    expect(screen.getByText(/1450 sq\. ft\./i)).toBeInTheDocument();
    expect(screen.getByText(/3 BHK/i)).toBeInTheDocument();
    expect(screen.getByText('Baner')).toBeInTheDocument();
    expect(screen.getByText('HistGradientBoostingRegressor')).toBeInTheDocument();
    expect(screen.getAllByText(/Decision support disclaimer/i).length).toBeGreaterThanOrEqual(1);
  });

  it('handles 404 not found error cleanly', async () => {
    const spy = vi.spyOn(apiClient.predictions, 'getPredictionDetail').mockRejectedValue(
      new NotFoundError('Prediction record not found or belongs to another user.')
    );

    renderWithProviders(<PredictionDetailPage />);

    expect(await screen.findByRole('heading', { name: 'Record Not Found' })).toBeInTheDocument();
    expect(screen.getByText('Prediction record not found or belongs to another user.')).toBeInTheDocument();
    expect(screen.getByText('Return to History')).toBeInTheDocument();
  });
});
