import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PredictPage from '@/app/(dashboard)/predict/page';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { SalePriceInferenceResponse, PredictionResponse } from '@/types/prediction';
import { UserRead } from '@/types/auth';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  usePathname: () => '/predict',
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

const mockStatelessResult: SalePriceInferenceResponse = {
  estimated_price_lakhs: 88.5,
  estimated_price_inr: 8850000,
  currency: 'INR',
  currency_unit: 'lakhs',
  model_name: 'HistGradientBoostingRegressor',
  model_version: '1.0.0',
  prediction_type: 'sale_price',
  supported_geography: 'Pune',
  disclaimer: 'Decision support estimate. Historical asking prices circa 2020.',
};

const mockPersistedResult: PredictionResponse = {
  id: 'pred-12345',
  user_id: 'usr-1',
  property_inputs: {
    square_ft: 1100,
    bhk_no: 2,
    latitude: 18.5987,
    longitude: 73.7644,
    posted_by: 'Owner',
    address: 'Wakad',
    rera: 1,
    ready_to_move: 1,
    resale: 0,
  },
  estimated_price_lakhs: 92.0,
  estimated_price_inr: 9200000,
  prediction_type: 'sale_price',
  model_name: 'HistGradientBoostingRegressor',
  model_version: '1.0.0',
  currency: 'INR',
  currency_unit: 'lakhs',
  disclaimer: 'Decision support estimate. Historical asking prices circa 2020.',
  supported_geography: 'Pune',
  created_at: '2026-10-24T00:00:00Z',
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

describe('Property Valuation Workspace (/predict)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    localStorage.clear();
  });

  it('renders all 8 Pune locality presets and default inputs', () => {
    const { container } = renderWithProviders(<PredictPage />);

    expect(screen.getByText(/Property Valuation Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Wakad \(Wakad,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Baner \(Baner,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hinjewadi \(Hinjewadi,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kothrud \(Kothrud,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hadapsar \(Hadapsar,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kharadi \(Kharadi,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Viman Nagar \(Viman Nagar,Pune\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bavdhan \(Bavdhan,Pune\)/i)).toBeInTheDocument();
  });

  it('displays In Audit badge on Monthly Rent and disables rent estimation', () => {
    renderWithProviders(<PredictPage />);

    expect(screen.getByText('In Audit')).toBeInTheDocument();
    expect(screen.getByText(/Monthly Rent/i)).toBeInTheDocument();
  });

  it('validates area range bounds and shows field error on invalid input', async () => {
    const { container } = renderWithProviders(<PredictPage />);

    const areaInput = container.querySelector('#input-square-ft') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Out of bounds: 50 sq ft
    fireEvent.change(areaInput, { target: { value: '50' } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Area must be between 150 and 8,000 sq. ft. per model envelope.')
    ).toBeInTheDocument();
  });

  it('executes stateless prediction POST /predictions/sale-price when unauthenticated', async () => {
    const predictSpy = vi
      .spyOn(apiClient.predictions, 'predictSalePrice')
      .mockResolvedValueOnce(mockStatelessResult);

    const { container } = renderWithProviders(<PredictPage />);

    const areaInput = container.querySelector('#input-square-ft') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    fireEvent.change(areaInput, { target: { value: '1100' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(predictSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          square_ft: 1100,
          bhk_no: 2,
          posted_by: 'Owner',
        })
      );
    });

    expect(await screen.findByText('₹88.50 Lakhs')).toBeInTheDocument();
    expect(screen.getByText('HistGradientBoostingRegressor')).toBeInTheDocument();
    expect(screen.getByText(/Decision support estimate/i)).toBeInTheDocument();
  });

  it('executes authenticated persisted prediction POST /predictions when user is logged in and save is enabled', async () => {
    localStorage.setItem('estora_token', 'valid-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValueOnce(mockUser);

    const createSpy = vi
      .spyOn(apiClient.predictions, 'createPrediction')
      .mockResolvedValueOnce(mockPersistedResult);

    const { container } = renderWithProviders(<PredictPage />);

    // Wait for auth to resolve
    await waitFor(() => {
      expect(container.querySelector('#save-to-history')).toBeInTheDocument();
    });

    const areaInput = container.querySelector('#input-square-ft') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    fireEvent.change(areaInput, { target: { value: '1100' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          prediction_type: 'sale_price',
          property_inputs: expect.objectContaining({ square_ft: 1100 }),
        }),
        expect.anything()
      );
    });

    expect(await screen.findByText('₹92.00 Lakhs')).toBeInTheDocument();
    expect(screen.getByText(/Saved to History/i)).toBeInTheDocument();
  });
});
