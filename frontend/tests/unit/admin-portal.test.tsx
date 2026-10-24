import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import AdminUsersPage from '@/app/admin/users/page';
import AdminPredictionsPage from '@/app/admin/predictions/page';
import AdminModelsPage from '@/app/admin/models/page';
import AdminDatasetsPage from '@/app/admin/datasets/page';
import AdminReportsPage from '@/app/admin/reports/page';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { UserRead } from '@/types/auth';
import { AdminAnalyticsSummary } from '@/types/analytics';
import { ModelArtifactRecord } from '@/types/admin';
import { PredictionResponse } from '@/types/prediction';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/admin/dashboard',
}));

const mockAdminUser: UserRead = {
  id: 'usr-admin-1',
  email: 'admin@estora.com',
  full_name: 'Lead Administrator',
  role: 'admin',
  is_active: true,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
};

const mockAdminAnalytics: AdminAnalyticsSummary = {
  total_users: 142,
  total_predictions: 890,
  sale_predictions: 890,
  rent_predictions: 0,
  active_models_count: 1,
  system_status: 'operational',
};

const mockModelRecord: ModelArtifactRecord = {
  id: 'mod-1',
  model_name: 'HistGradientBoostingRegressor',
  model_version: '1.0.0',
  prediction_type: 'sale_price',
  artifact_path: 'ml/artifacts/sale_price_pipeline_v1.0.0.joblib',
  feature_schema: { square_ft: 'numeric' },
  is_active: true,
  supported_geography: 'Pune',
  metrics: {
    holdout_mae: 17.35,
    holdout_rmse: 40.71,
    holdout_r2: 0.807,
  },
  trained_at: '2026-10-24T00:00:00Z',
};

const samplePrediction: PredictionResponse = {
  id: 'pred-audit-1',
  user_id: 'usr-1',
  property_inputs: {
    square_ft: 1500,
    bhk_no: 3,
    latitude: 18.559,
    longitude: 73.7868,
    posted_by: 'Owner',
    address: 'Wakad',
    rera: 1,
    ready_to_move: 1,
    resale: 0,
  },
  estimated_price_lakhs: 120.0,
  estimated_price_inr: 12000000,
  prediction_type: 'sale_price',
  model_name: 'HistGradientBoostingRegressor',
  model_version: '1.0.0',
  currency: 'INR',
  currency_unit: 'lakhs',
  disclaimer: 'Admin audit disclaimer',
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

describe('Admin Dashboard (/admin/dashboard)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-admin-token');
    localStorage.setItem('estora_user', JSON.stringify(mockAdminUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockAdminUser);
    vi.spyOn(apiClient.health, 'checkReady').mockResolvedValue({
      status: 'ready',
      dependencies: {
        database: 'connected',
        model_artifacts: 'available',
      },
    });
  });

  it('renders system KPIs, ready health check, and active model tag', async () => {
    vi.spyOn(apiClient.admin, 'getSystemAnalytics').mockResolvedValue(mockAdminAnalytics);

    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Platform Operations Overview')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getAllByText('890').length).toBe(2);
    expect(screen.getByText('Total Valuations')).toBeInTheDocument();
  });

  it('handles admin analytics failure gracefully with retry option', async () => {
    let attempts = 0;
    vi.spyOn(apiClient.admin, 'getSystemAnalytics').mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('Administrative analytics service offline.');
      }
      return mockAdminAnalytics;
    });

    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Administrative analytics service offline.')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText('142')).toBeInTheDocument();
    expect(attempts).toBe(2);
  });
});

describe('Admin Users (/admin/users)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-admin-token');
    localStorage.setItem('estora_user', JSON.stringify(mockAdminUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockAdminUser);
  });

  it('renders paginated user accounts with roles and active status', async () => {
    vi.spyOn(apiClient.admin, 'listUsers').mockResolvedValue([mockAdminUser]);

    renderWithProviders(<AdminUsersPage />);

    expect(await screen.findByText('admin@estora.com')).toBeInTheDocument();
    expect(screen.getAllByText('Lead Administrator').length).toBe(2);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('Admin Predictions (/admin/predictions)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-admin-token');
    localStorage.setItem('estora_user', JSON.stringify(mockAdminUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockAdminUser);
  });

  it('renders platform prediction audit table with estimates and locations', async () => {
    vi.spyOn(apiClient.admin, 'listPredictions').mockResolvedValue([samplePrediction]);

    renderWithProviders(<AdminPredictionsPage />);

    expect(await screen.findByText('Wakad')).toBeInTheDocument();
    expect(screen.getByText('₹120.00L')).toBeInTheDocument();
    expect(screen.getByText('pred-audit-1')).toBeInTheDocument();
  });
});

describe('Admin Models (/admin/models)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-admin-token');
    localStorage.setItem('estora_user', JSON.stringify(mockAdminUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockAdminUser);
  });

  it('renders registered model metadata and held-out validation metrics', async () => {
    vi.spyOn(apiClient.admin, 'listModels').mockResolvedValue([mockModelRecord]);

    renderWithProviders(<AdminModelsPage />);

    expect(await screen.findByText('HistGradientBoostingRegressor')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('₹17.35L')).toBeInTheDocument();
    expect(screen.getByText('0.807')).toBeInTheDocument();
  });
});

describe('Admin Datasets & Reports (/admin/datasets & /admin/reports)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-admin-token');
    localStorage.setItem('estora_user', JSON.stringify(mockAdminUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockAdminUser);
    vi.spyOn(apiClient.admin, 'getSystemAnalytics').mockResolvedValue(mockAdminAnalytics);
  });

  it('renders verified 1,833 dataset records and 5-stage cleaning pipeline', async () => {
    renderWithProviders(<AdminDatasetsPage />);

    expect(await screen.findByText('1,833')).toBeInTheDocument();
    expect(screen.getByText(/Deterministic 5-Stage Preparation Funnel/i)).toBeInTheDocument();
    expect(screen.getByText(/Audited Artifact v1.0.0/i)).toBeInTheDocument();
  });

  it('renders benchmark comparison table with production champion model', async () => {
    renderWithProviders(<AdminReportsPage />);

    expect(await screen.findByText('Dummy Median Regressor')).toBeInTheDocument();
    expect(screen.getByText('HistGradientBoostingRegressor (v1.0.0)')).toBeInTheDocument();
    expect(screen.getAllByText('₹17.35L').length).toBeGreaterThanOrEqual(1);
  });
});
