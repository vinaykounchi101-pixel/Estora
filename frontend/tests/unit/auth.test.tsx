import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { useAuth } from '@/lib/auth/use-auth';
import { ProtectedRoute, AdminRoute } from '@/lib/auth/route-guard';
import { apiClient } from '@/lib/api/client';
import { UserRead } from '@/types/auth';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/protected-target',
}));

const mockRegularUser: UserRead = {
  id: 'usr-1',
  email: 'user@estora.com',
  full_name: 'Regular User',
  role: 'authenticated_user',
  is_active: true,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
};

const mockAdminUser: UserRead = {
  id: 'admin-1',
  email: 'admin@estora.com',
  full_name: 'Administrator',
  role: 'admin',
  is_active: true,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
};

function TestConsumer() {
  const { user, isAuthenticated, isAdmin, login, logout, isLoading } = useAuth();
  if (isLoading) return <div>Loading Auth...</div>;
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Unauthenticated'}</div>
      <div data-testid="admin-status">{isAdmin ? 'Admin' : 'Non-Admin'}</div>
      <div data-testid="user-email">{user?.email || 'No-User'}</div>
      <button
        onClick={() =>
          login({
            email: 'user@estora.com',
            password: 'Password123!',
          })
        }
      >
        Trigger Login
      </button>
      <button onClick={() => logout()}>Trigger Logout</button>
    </div>
  );
}

describe('Authentication & Session Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockReplace.mockReset();
    localStorage.clear();
    apiClient.setAuthToken(null);
  });

  it('initializes as unauthenticated when localStorage is empty', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading Auth...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('Unauthenticated');
    expect(screen.getByTestId('user-email').textContent).toBe('No-User');
  });

  it('restores stored token and verifies user from backend', async () => {
    localStorage.setItem('estora_token', 'valid-mock-jwt');
    localStorage.setItem('estora_user', JSON.stringify(mockRegularUser));

    vi.spyOn(apiClient.users, 'getMe').mockResolvedValueOnce(mockRegularUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    expect(screen.getByTestId('user-email').textContent).toBe('user@estora.com');
    expect(screen.getByTestId('admin-status').textContent).toBe('Non-Admin');
  });

  it('clears session when stored token verification fails with 401', async () => {
    localStorage.setItem('estora_token', 'expired-mock-jwt');
    localStorage.setItem('estora_user', JSON.stringify(mockRegularUser));

    vi.spyOn(apiClient.users, 'getMe').mockRejectedValueOnce(new Error('401 Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Unauthenticated');
    });

    expect(localStorage.getItem('estora_token')).toBeNull();
    expect(localStorage.getItem('estora_user')).toBeNull();
  });

  it('stores token and user on successful login', async () => {
    vi.spyOn(apiClient.auth, 'login').mockResolvedValueOnce({
      access_token: 'new-login-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: mockRegularUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading Auth...')).not.toBeInTheDocument();
    });

    const loginBtn = screen.getByText('Trigger Login');
    await act(async () => {
      loginBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    expect(localStorage.getItem('estora_token')).toBe('new-login-token');
    expect(screen.getByTestId('user-email').textContent).toBe('user@estora.com');
  });

  it('clears token and user on logout', async () => {
    localStorage.setItem('estora_token', 'active-token');
    localStorage.setItem('estora_user', JSON.stringify(mockRegularUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValueOnce(mockRegularUser);
    vi.spyOn(apiClient.auth, 'logout').mockResolvedValueOnce({ success: true });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    const logoutBtn = screen.getByText('Trigger Logout');
    await act(async () => {
      logoutBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Unauthenticated');
    });

    expect(localStorage.getItem('estora_token')).toBeNull();
    expect(localStorage.getItem('estora_user')).toBeNull();
  });
});

describe('Route Protection Guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockReplace.mockReset();
    localStorage.clear();
  });

  it('ProtectedRoute redirects to login with safe redirect URL when unauthenticated', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret User Workspace</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/login?redirect='));
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('ProtectedRoute renders protected children when authenticated', async () => {
    localStorage.setItem('estora_token', 'valid-token');
    localStorage.setItem('estora_user', JSON.stringify(mockRegularUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValueOnce(mockRegularUser);

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret User Workspace</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('AdminRoute displays administrative access restricted banner for non-admin users', async () => {
    localStorage.setItem('estora_token', 'valid-token');
    localStorage.setItem('estora_user', JSON.stringify(mockRegularUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValueOnce(mockRegularUser);

    render(
      <AuthProvider>
        <AdminRoute>
          <div data-testid="admin-content">Secret Admin Console</div>
        </AdminRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Administrative Access Restricted')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('AdminRoute renders admin content for users with admin role', async () => {
    localStorage.setItem('estora_token', 'admin-token');
    localStorage.setItem('estora_user', JSON.stringify(mockAdminUser));
    vi.spyOn(apiClient.users, 'getMe').mockResolvedValueOnce(mockAdminUser);

    render(
      <AuthProvider>
        <AdminRoute>
          <div data-testid="admin-content">Secret Admin Console</div>
        </AdminRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    expect(screen.queryByText('Administrative Access Restricted')).not.toBeInTheDocument();
  });
});
