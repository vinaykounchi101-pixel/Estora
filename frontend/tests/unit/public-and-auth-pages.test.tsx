import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AboutPage from '@/app/(marketing)/about/page';
import MethodologyPage from '@/app/(marketing)/methodology/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { apiClient } from '@/lib/api/client';
import { ApiHttpError } from '@/lib/api/errors';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirect' ? '/dashboard' : null),
  }),
  usePathname: () => '/login',
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ThemeProvider>
  );
}

describe('Public Marketing Pages', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders About page with architecture, governance, and supported scope', () => {
    renderWithProviders(<AboutPage />);

    expect(screen.getByText(/Architectural Intelligence for Real Estate Valuation/i)).toBeInTheDocument();
    expect(screen.getByText(/Architecture & Mission/i)).toBeInTheDocument();
    expect(screen.getByText(/editorial decision-support platform/i)).toBeInTheDocument();
  });

  it('renders Methodology page with verified Pune metrics and 1,833 records', () => {
    renderWithProviders(<MethodologyPage />);

    expect(screen.getAllByText('1,833').length).toBeGreaterThan(0);
    expect(screen.getByText('₹17.35L')).toBeInTheDocument();
    expect(screen.getAllByText('0.807').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/HistGradientBoosting/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Important Price Semantics Disclosure/i)).toBeInTheDocument();
  });

  it('renders Forgot Password page with honest SRS FR-AUTH-006 deferred disclosure', () => {
    renderWithProviders(<ForgotPasswordPage />);

    expect(screen.getByText(/Password Recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Automated Reset Deferred/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@estora.internal/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Sign In/i)).toBeInTheDocument();
  });
});

describe('Authentication Pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    localStorage.clear();
  });

  it('renders Login form and validates required fields', async () => {
    const { container } = renderWithProviders(<LoginPage />);

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Email address is required.')).toBeInTheDocument();
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
  });

  it('handles login with invalid credentials and renders API error', async () => {
    vi.spyOn(apiClient.auth, 'login').mockRejectedValueOnce(
      new ApiHttpError(401, 'Invalid email or password.')
    );

    const { container } = renderWithProviders(<LoginPage />);

    const emailInput = container.querySelector('#login-email') as HTMLInputElement;
    const passwordInput = container.querySelector('#login-password') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPass123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });
  });

  it('renders Register form and validates password length constraint', async () => {
    const { container } = renderWithProviders(<RegisterPage />);

    const emailInput = container.querySelector('#register-email') as HTMLInputElement;
    const passwordInput = container.querySelector('#register-password') as HTMLInputElement;
    const confirmInput = container.querySelector('#register-confirm-password') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('validates password confirmation mismatch on register form', async () => {
    const { container } = renderWithProviders(<RegisterPage />);

    const emailInput = container.querySelector('#register-email') as HTMLInputElement;
    const passwordInput = container.querySelector('#register-password') as HTMLInputElement;
    const confirmInput = container.querySelector('#register-confirm-password') as HTMLInputElement;
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'MismatchPassword123!' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });
});
