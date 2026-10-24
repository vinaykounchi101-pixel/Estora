import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '@/app/(dashboard)/settings/page';
import PropertiesPage from '@/app/(dashboard)/properties/page';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { UserRead } from '@/types/auth';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/settings',
}));

const mockUser: UserRead = {
  id: 'usr-42',
  email: 'vinay@estora.com',
  full_name: 'Vinay Kounchi',
  role: 'authenticated_user',
  is_active: true,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
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

describe('Settings Page (/settings)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-mock-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockUser);
  });

  it('pre-fills profile form with user details', async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByDisplayValue('Vinay Kounchi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('vinay@estora.com')).toBeInTheDocument();
  });

  it('submits updated profile data to PATCH /api/v1/users/me', async () => {
    const updateSpy = vi.spyOn(apiClient.users, 'updateMe').mockResolvedValue({
      ...mockUser,
      full_name: 'Vinay Kounchi Updated',
    });

    renderWithProviders(<SettingsPage />);

    const nameInput = await screen.findByDisplayValue('Vinay Kounchi');
    fireEvent.change(nameInput, { target: { value: 'Vinay Kounchi Updated' } });

    const submitBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        { full_name: 'Vinay Kounchi Updated' },
        expect.objectContaining({ authToken: 'valid-mock-token' })
      );
    });
  });

  it('validates password mismatch and min length', async () => {
    renderWithProviders(<SettingsPage />);

    const newPwInput = await screen.findByLabelText(/^New Password/i);
    const confirmPwInput = screen.getByLabelText(/^Confirm New Password/i);

    fireEvent.change(newPwInput, { target: { value: 'short' } });
    fireEvent.change(confirmPwInput, { target: { value: 'mismatch' } });

    const submitBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/New password must be at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });
});

describe('Properties Page (/properties)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('estora_token', 'valid-mock-token');
    localStorage.setItem('estora_user', JSON.stringify(mockUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValue(mockUser);
  });

  it('displays honest coming-soon roadmap state for property bookmarking', async () => {
    renderWithProviders(<PropertiesPage />);

    expect(await screen.findByText(/Property Portfolio Bookmarking Coming Soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Roadmap Feature \(Phase P2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Valuation Studio/i).closest('a')).toHaveAttribute('href', '/predict');
    expect(screen.getByText(/View Valuation History/i).closest('a')).toHaveAttribute('href', '/predictions');
  });
});
